from rest_framework import serializers
from .models import GameComment


class GameCommentSerializer(serializers.ModelSerializer):

    user_email = serializers.EmailField(source="user.email", read_only=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = GameComment
        fields = [
            "id",
            "text",
            "user_email",
            "profile_picture",
            "created_at",
        ]

    def get_profile_picture(self, obj):
        request = self.context.get("request")

        if obj.profile_picture and hasattr(obj.profile_picture, "url"):
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url

        return None

