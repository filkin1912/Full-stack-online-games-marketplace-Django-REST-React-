from django.db import models
from django.contrib.auth import get_user_model
from cloudinary.models import CloudinaryField

UserModel = get_user_model()


class GameModel(models.Model):
    CATEGORY_CHOICES = [
        ("ACTION", "Action"),
        ("ADVENTURE", "Adventure"),
        ("PUZZLE", "Puzzle"),
        ("STRATEGY", "Strategy"),
        ("SPORTS", "Sports"),
        ("BOARD", "Board"),
        ("OTHER", "Other"),
    ]

    title = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
    )

    summary = models.TextField(
        blank=True,
        null=True,
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="OTHER",
        db_index=True,
    )

    game_picture = CloudinaryField(
        "game_image",
        blank=True,
        null=True,
    )

    user = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="games",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Game"
        verbose_name_plural = "Games"

    def __str__(self):
        return f"{self.title} ({self.category})"
