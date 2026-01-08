from rest_framework import serializers
from .models import AppUser
from ..games.models import GameModel


class AppUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    display_name = serializers.ReadOnlyField()
    games_count = serializers.SerializerMethodField()

    class Meta:
        model = AppUser
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'full_name', 'display_name',
            'money', 'profile_picture',
            'games_count',
        ]
        read_only_fields = ['id', 'full_name', 'display_name', 'games_count']

    def get_games_count(self, obj):
        # Count games created by this user
        return GameModel.objects.filter(user=obj).count()


class AppUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "money",
            "profile_picture"
        )
