from rest_framework import generics, permissions
from exam_project.common.models import GameComment
from exam_project.common.serializers import GameCommentSerializer

from rest_framework.parsers import MultiPartParser, FormParser


class CommentListCreateApiView(generics.ListCreateAPIView):

    serializer_class = GameCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)  # Allow file uploads

    def get_queryset(self):
        game_id = self.kwargs["game_id"]
        return GameComment.objects.filter(game_id=game_id).order_by("created_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        print("EXECUTED CREATE API COMMENT")
        user = self.request.user
        profile_picture = self.request.FILES.get("profile_picture")
        serializer.save(
            user=user,
            game_id=self.kwargs["game_id"],
            profile_picture=user.profile_picture
        )


class CommentDeleteApiView(generics.DestroyAPIView):
    serializer_class = GameCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GameComment.objects.filter(user=self.request.user)
