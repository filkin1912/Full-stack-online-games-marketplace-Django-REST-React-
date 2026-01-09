from django.apps import AppConfig
from django.core.management import call_command


class CommonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'exam_project.games'

    def ready(self):
        try:
            call_command("load_initial_games")
        except Exception:
            pass
