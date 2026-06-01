from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
from pgvector.django import VectorField

UserModel = get_user_model()


class GameEmbeddingChunk(models.Model):
    """One searchable chunk per shop game for RAG (pgvector)."""

    game = models.OneToOneField(
        "games.GameModel",
        on_delete=models.CASCADE,
        related_name="rag_chunk",
        primary_key=True,
    )
    content = models.TextField()
    embedding = VectorField(dimensions=settings.RAG_EMBEDDING_DIMENSIONS)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Game embedding chunk"
        verbose_name_plural = "Game embedding chunks"

    def __str__(self):
        return f"RAG chunk: {self.game_id}"


class ChatMemory(models.Model):
    user = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="chat_memory"
    )
    key = models.CharField(max_length=255)
    value = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Chat Memory"
        verbose_name_plural = "Chat Memories"

    def __str__(self):
        return f"{self.user.email} - {self.key}"
