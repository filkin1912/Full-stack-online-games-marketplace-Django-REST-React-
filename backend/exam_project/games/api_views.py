from rest_framework import generics, filters, status, permissions
from rest_framework.response import Response
from django.db import transaction

from .models import GameModel
from exam_project.common.models import BoughtGame
from .serializers import GameSerializer, GameUpdateSerializer
from .permission_mixins import (
    IsAuthenticatedMixin,
    OwnerOnlyMixin,
    GameQuerysetMixin,
    MyGamesQuerysetMixin,
)
from datetime import datetime
import random
from decimal import Decimal


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
        # Anyone can view games, only authenticated users can create
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
        # Editing requires authentication; viewing is public
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

            seller = game.user

            # Already purchased?
            if BoughtGame.objects.filter(user=buyer, game=game).exists():
                return Response({"detail": "Already purchased."}, status=status.HTTP_400_BAD_REQUEST)

            # Enough money?
            if buyer.money < game.price:
                return Response({"detail": "Insufficient funds."}, status=status.HTTP_400_BAD_REQUEST)

            # Money transfer
            buyer.money -= game.price
            buyer.save(update_fields=['money'])

            seller.money += game.price
            seller.save(update_fields=['money'])

            # Create purchase record
            BoughtGame.objects.create(user=buyer, game=game)

        # Return full game data (same shape as Home.js)
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
    serializer_class = GameSerializer  # not used for creation, but keeps consistency

    def post(self, request, *args, **kwargs):
        categories = [c[0] for c in GameModel._meta.get_field("category").choices]

        # Timestamp for uniqueness
        now = datetime.now().strftime("%Y%m%d-%H%M%S")

        # Create 20 auto-generated games
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
