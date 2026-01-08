#!/bin/sh

echo "Waiting for Postgres..."
until nc -z db 5432; do
  sleep 1
done

echo "Postgres is up - running migrations"
python manage.py migrate --noinput

echo "Collecting static files"
python manage.py collectstatic --noinput

echo "Checking if initial games need to be loaded..."
python - << 'EOF'
from games.models import GameModel
from django.core.management import call_command

# Load fixture only if DB is empty
if not GameModel.objects.exists():
    print("No games found — loading initial_games.json")
    call_command('loaddata', 'initial_games.json')
else:
    print("Games already exist — skipping fixture load")
EOF

echo "Starting Gunicorn"
exec gunicorn exam_project.wsgi:application --bind 0.0.0.0:8000
