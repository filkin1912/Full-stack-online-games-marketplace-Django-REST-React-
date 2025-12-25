from rest_framework import generics, permissions
from exam_project.common.models import GameComment
from exam_project.common.serializers import GameCommentSerializer


class CommentListCreateApiView(generics.ListCreateAPIView):
    serializer_class = GameCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        game_id = self.kwargs["game_id"]
        return GameComment.objects.filter(game_id=game_id).order_by("created_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            game_id=self.kwargs["game_id"]
        )


class CommentDeleteApiView(generics.DestroyAPIView):
    serializer_class = GameCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # User can delete ONLY their own comments
        return GameComment.objects.filter(user=self.request.user)
