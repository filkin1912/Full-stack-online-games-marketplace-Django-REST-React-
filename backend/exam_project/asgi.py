"""
ASGI config for exam_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from fastapi import FastAPI

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_project.settings')

django_asgi_app = get_asgi_application()

from exam_project.fast_api import fast_app

application = FastAPI(title="Exam Project Unified API")
application.mount("/fastapi", fast_app)
application.mount("/", django_asgi_app)
