#!/bin/sh

echo "Running migrations"
python manage.py migrate --noinput

echo "Starting Gunicorn"
exec gunicorn exam_project.asgi:application --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
