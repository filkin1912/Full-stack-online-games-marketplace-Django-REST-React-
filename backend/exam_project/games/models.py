from decimal import Decimal
from enum import Enum

from django.contrib.auth import get_user_model
from django.core import validators
from django.db import models

UserModel = get_user_model()


class Choices(Enum):
    @classmethod
    def choices(cls):
        return [(x.name, x.value) for x in cls]

    @classmethod
    def max_len(cls):
        return max(len(name) for name, _ in cls.choices())


class Category(Choices):
    ACTION = "Action"
    ADVENTURE = "Adventure"
    PUZZLE = "Puzzle"
    STRATEGY = "Strategy"
    SPORTS = "Sports"
    BOARD = "Board/Card Game"
    OTHER = "Other"


class GameModel(models.Model):
    title = models.CharField(max_length=24, unique=True, null=False, blank=False, )
    category = models.CharField(max_length=Category.max_len(), choices=Category.choices(), )
    price = models.DecimalField(
        max_digits=5,  # total digits (3 before + 2 after decimal)
        decimal_places=2,  # allow two digits after decimal
        validators=[
            validators.MinValueValidator(Decimal('10.00')),  # minimum price
            validators.MaxValueValidator(Decimal('999.99')),  # maximum price
        ],
        null=False, blank=False,)
    game_picture = models.ImageField(upload_to="game_pics/", blank=True, null=True, default="profile_pics/no-image.jpg")
    summary = models.TextField(null=True, blank=True, )
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title}  --  {self.category}'
