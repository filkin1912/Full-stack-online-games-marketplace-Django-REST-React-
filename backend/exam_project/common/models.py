from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import models
from exam_project.games.models import GameModel

UserModel = get_user_model()


class BoughtGame(models.Model):
    game = models.ForeignKey(
        GameModel,
        on_delete=models.CASCADE,
    )

    user = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
    )

    class Meta:
        unique_together = ('game', 'user')


class GameComment(models.Model):
    game = models.ForeignKey(GameModel, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    profile_picture = models.ImageField(upload_to="comment_pics/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('game', 'user')

