import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "exam_project.settings")
django.setup()

from asgiref.sync import sync_to_async
from django.db import close_old_connections
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from exam_project.fast_api_urls import fast_api_router

fast_app = FastAPI(title="Exam Project FastAPI", version="1.0.0")

# -------------------------
# CORS (React → FastAPI)
# -------------------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

fast_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@fast_app.middleware("http")
async def django_db_connections_middleware(request, call_next):
    # Prevent stale DB connections across long-lived FastAPI workers.
    await sync_to_async(close_old_connections, thread_sensitive=True)()
    try:
        response = await call_next(request)
    finally:
        await sync_to_async(close_old_connections, thread_sensitive=True)()
    return response


@fast_app.get("/fast/health", tags=["fast-health"])
async def fast_health() -> dict[str, str]:
    return {"status": "ok"}


fast_app.include_router(fast_api_router)
