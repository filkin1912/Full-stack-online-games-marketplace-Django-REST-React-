from rest_framework import serializers
from exam_project.common.models import GameComment


class GameCommentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = GameComment
        fields = ["id", "text", "user_email", "created_at"]
