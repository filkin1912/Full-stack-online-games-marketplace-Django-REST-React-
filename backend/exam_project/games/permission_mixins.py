from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from exam_project.games.models import GameModel
from exam_project.common.models import BoughtGame


# ✅ Allows read-only for anonymous users, write for authenticated users
class IsAuthenticatedOrReadOnlyMixin:
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ✅ Requires authentication for all requests
class IsAuthenticatedMixin:
    permission_classes = [permissions.IsAuthenticated]


# ✅ Ensures only the owner can modify (PATCH/PUT/DELETE)
class OwnerOnlyMixin:
    def check_object_permissions(self, request, obj):
        if request.method in ('PATCH', 'PUT', 'DELETE') and obj.user_id != request.user.id:
            raise PermissionDenied("You can only modify your own listings.")
        return super().check_object_permissions(request, obj)


# ✅ Queryset mixin for all games with user preloaded
class GameQuerysetMixin:
    queryset = GameModel.objects.select_related('user').all()


# ✅ Queryset mixin for "my games"
class MyGamesQuerysetMixin:
    def get_queryset(self):
        return GameModel.objects.filter(user=self.request.user).select_related('user')


# ✅ Queryset mixin for "my bought games"
class MyBoughtGamesQuerysetMixin:
    def get_queryset(self):
        return BoughtGame.objects.filter(user=self.request.user).select_related('game')
