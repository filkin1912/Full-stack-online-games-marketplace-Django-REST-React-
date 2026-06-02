from django.contrib import admin

from .models import ChatMemory, GameEmbeddingChunk


@admin.register(ChatMemory)
class ChatMemoryAdmin(admin.ModelAdmin):
    """Admin configuration for browsing user chat memories."""
    list_display = ("user", "key", "value", "created_at")
    list_filter = ("key",)
    search_fields = ("user__email", "key", "value")


@admin.register(GameEmbeddingChunk)
class GameEmbeddingChunkAdmin(admin.ModelAdmin):
    """Admin view for RAG chunks linked to shop games."""
    list_display = ("game", "updated_at")
    search_fields = ("game__title", "content")
    readonly_fields = ("content", "updated_at")
