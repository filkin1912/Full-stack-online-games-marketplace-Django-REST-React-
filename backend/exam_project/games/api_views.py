from datetime import datetime
import random
from decimal import Decimal

from django.db import transaction
from django.core.management import call_command

from rest_framework import generics, filters, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import GameModel
from exam_project.common.models import BoughtGame
from .serializers import GameSerializer, GameUpdateSerializer
from .permission_mixins import (
    IsAuthenticatedMixin,
    OwnerOnlyMixin,
    GameQuerysetMixin,
    MyGamesQuerysetMixin,
)


# =====================================================
# PUBLIC: LIST GAMES (GET) | AUTH REQUIRED: CREATE (POST)
# =====================================================
class GamesListCreateApiView(GameQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = GameSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title']
    ordering_fields = ['price', 'title', 'id']
    ordering = ['-id']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =====================================================
# GAME DETAILS / UPDATE / DELETE
# =====================================================
class GameRetrieveUpdateDeleteApiView(
    OwnerOnlyMixin,
    GameQuerysetMixin,
    generics.RetrieveUpdateDestroyAPIView
):
    def get_permissions(self):
        if self.request.method in ('PATCH', 'PUT', 'DELETE'):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        return GameSerializer if self.request.method == 'GET' else GameUpdateSerializer


# =====================================================
# MY GAMES (AUTH ONLY)
# =====================================================
class MyGamesListApiView(IsAuthenticatedMixin, MyGamesQuerysetMixin, generics.ListAPIView):
    serializer_class = GameSerializer


# =====================================================
# BUY GAME (AUTH ONLY)
# =====================================================
class GameBuyApiView(IsAuthenticatedMixin, generics.CreateAPIView):
    serializer_class = GameSerializer

    def post(self, request, *args, **kwargs):
        game_id = kwargs['pk']
        buyer = request.user

        with transaction.atomic():
            try:
                game = GameModel.objects.select_for_update().get(pk=game_id)
            except GameModel.DoesNotExist:
                return Response({"detail": "Game not found."}, status=status.HTTP_404_NOT_FOUND)

            # Already bought?
            if BoughtGame.objects.filter(user=buyer, game=game).exists():
                return Response({"detail": "Already purchased."}, status=status.HTTP_400_BAD_REQUEST)

            # Check funds
            if buyer.money < game.price:
                return Response({"detail": "Insufficient funds."}, status=status.HTTP_400_BAD_REQUEST)

            # Deduct from buyer
            buyer.money -= game.price
            buyer.save(update_fields=['money'])

            # Pay seller ONLY if seller exists
            seller = game.user
            if seller is not None:
                seller.money += game.price
                seller.save(update_fields=['money'])

            # Create purchase record
            BoughtGame.objects.create(user=buyer, game=game)

        serializer = GameSerializer(game, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# =====================================================
# BOUGHT GAMES (AUTH ONLY)
# =====================================================
class BoughtGamesListApiView(IsAuthenticatedMixin, generics.ListAPIView):
    serializer_class = GameSerializer

    def get_queryset(self):
        return (
            GameModel.objects
            .filter(boughtgame__user=self.request.user)
            .select_related('user')
            .order_by('-id')
            .distinct()
        )


# =====================================================
# SEED GAMES (AUTH ONLY)
# =====================================================
class SeedGamesApiView(IsAuthenticatedMixin, generics.CreateAPIView):
    serializer_class = GameSerializer  # not used for creation

    def post(self, request, *args, **kwargs):
        categories = [c[0] for c in GameModel._meta.get_field("category").choices]
        now = datetime.now().strftime("%Y%m%d-%H%M%S")

        GameModel.objects.bulk_create([
            GameModel(
                title=f"Game {i} - {now}"[:24],
                category=random.choice(categories),
                price=Decimal(random.randrange(100, 280)),
                summary="Auto-generated",
                user=request.user,
            )
            for i in range(1, 21)
        ])

        return Response(
            {"detail": "20 games created successfully."},
            status=status.HTTP_201_CREATED
        )


# =====================================================
# LOAD GAMES (AUTH ONLY)
# =====================================================
class LoadGamesApiView(IsAuthenticatedMixin, APIView):
    """
    Loads initial_games.json only if no games exist.
    If the database becomes empty again later, loading is allowed again.
    """

    def post(self, request, *args, **kwargs):
        # If games exist, block loading
        if GameModel.objects.exists():
            return Response(
                {"detail": "Games already exist. Loading skipped."},
                status=status.HTTP_200_OK
            )

        try:
            call_command("loaddata", "initial_games.json")

            return Response(
                {"detail": "Initial games loaded successfully."},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"detail": f"Error loading games: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
