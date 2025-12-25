#!/bin/sh

echo "Waiting for Postgres..."
until nc -z db 5432; do
  sleep 1
done

echo "Postgres is up - running migrations"
python manage.py migrate --noinput

echo "Collecting static files"
python manage.py collectstatic --noinput

echo "Starting Gunicorn"
exec gunicorn exam_project.wsgi:application --bind 0.0.0.0:8000
