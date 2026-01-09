from django.core.management.base import BaseCommand
from django.core.management import call_command
from games.models import GameModel


class Command(BaseCommand):
    help = "Loads initial_games.json if no games exist"

    def handle(self, *args, **kwargs):
        if GameModel.objects.exists():
            self.stdout.write(self.style.WARNING("Games already exist. Skipping fixture load."))
        else:
            call_command("loaddata", "initial_games.json")
            self.stdout.write(self.style.SUCCESS("Initial games loaded successfully."))
