from django.contrib import admin
from exam_project.common.models import GameComment, BoughtGame


@admin.register(GameComment)
class GameCommentAdmin(admin.ModelAdmin):
    list_display = ('game', 'user', 'text', 'created_at')
    search_fields = ('text', 'user__email', 'game__title')
    list_filter = ('created_at', 'game')


@admin.register(BoughtGame)
class BoughtGameAdmin(admin.ModelAdmin):
    list_display = ('game', 'user')
    search_fields = ('user__email', 'game__title')
    list_filter = ('game',)
