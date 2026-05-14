from rest_framework import serializers
from .models import AppUser
from ..games.models import GameModel


class AppUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    display_name = serializers.ReadOnlyField()
    games_count = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()

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
        return GameModel.objects.filter(user=obj).count()

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None


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
