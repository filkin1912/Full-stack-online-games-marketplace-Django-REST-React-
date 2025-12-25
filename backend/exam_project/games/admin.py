from django.contrib import admin
from exam_project.games.models import GameModel
from exam_project.games.forms import GameAdminForm


@admin.register(GameModel)
class GameModelAdmin(admin.ModelAdmin):
    form = GameAdminForm  # admin uses the full form with user

    list_display = ('title', 'category', 'price', 'created_at', 'user')
    search_fields = ('title', 'category', 'user__email')
    ordering = ('title',)

    fieldsets = (
        (None, {
            'fields': ('title', 'category', 'price', 'game_picture', 'summary')
        }),
        ('Ownership', {
            'fields': ('user',)
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('title', 'category', 'price', 'game_picture', 'summary', 'user'),
        }),
    )
