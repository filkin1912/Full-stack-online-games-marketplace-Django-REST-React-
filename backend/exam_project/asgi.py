"""
ASGI config for exam_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from django.conf import settings
from django.core.asgi import get_asgi_application
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_project.settings')

django_asgi_app = get_asgi_application()

from exam_project.fast_api_urls import fast_api_router

application = FastAPI(title="Exam Project Unified API")
allowed_origins = list(getattr(settings, "CORS_ALLOWED_ORIGINS", []))
if not allowed_origins:
    # Safe local fallback when env var is missing.
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
application.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
application.include_router(fast_api_router)
application.get("/fast/health", tags=["fast-health"])(lambda: {"status": "ok"})
application.mount("/", django_asgi_app)
