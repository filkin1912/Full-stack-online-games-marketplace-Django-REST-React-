from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    def handle(self, *args, **options):
        User = get_user_model()
        admin_email = "admin@example.com"

        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(
                email=admin_email,
                password="admin123",
                first_name="Admin",
                last_name="User"
            )
            self.stdout.write(self.style.SUCCESS("Admin user created"))
        else:
            self.stdout.write(self.style.WARNING("Admin user already exists"))
