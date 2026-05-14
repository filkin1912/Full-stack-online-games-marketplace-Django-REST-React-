from django.db import models
from django.contrib.auth import get_user_model

UserModel = get_user_model()


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
