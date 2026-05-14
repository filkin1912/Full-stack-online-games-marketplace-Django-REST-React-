from pathlib import Path
from datetime import timedelta
from django.urls import reverse_lazy
import os
from dotenv import load_dotenv
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env.local only in development
ENV_FILE = BASE_DIR / ".env.local"
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)

# ==========================
# Security
# ==========================
SECRET_KEY = os.getenv("SECRET_KEY")
DEBUG = os.getenv("DEBUG", "False") == "True"
AI_API_KEY = os.getenv("AI_API_KEY")


# Cloud Run passes ALLOWED_HOSTS as comma-separated string
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")

SESSION_COOKIE_NAME = os.getenv("SESSION_COOKIE_NAME", "sessionid")

# Tell Django it's behind a proxy that terminates SSL (Cloud Run)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# ==========================
# Installed Apps
# ==========================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "widget_tweaks",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",

    "cloudinary",
    "cloudinary_storage",

    "exam_project.accounts",
    "exam_project.games",
    "exam_project.common",
    "exam_project.chatbot",
]

# ==========================
# Middleware
# ==========================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "exam_project.urls"
WSGI_APPLICATION = "exam_project.wsgi.application"

# ==========================
# Templates
# ==========================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "exam_project.context_processors.user_money",
            ],
        },
    },
]

# ==========================
# Database (Neon PostgreSQL)
# ==========================
DATABASE_URL = os.getenv("DATABASE_URL")

DATABASES = {
    "default": dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=600,
        ssl_require=True,
    )
}

# ==========================
# Fixtures
# ==========================
FIXTURE_DIRS = [
    BASE_DIR / "games" / "fixtures",
]

# ==========================
# CORS & CSRF
# ==========================
raw_origins = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")

CORS_ALLOWED_ORIGINS = []
CSRF_TRUSTED_ORIGINS = []

for origin in raw_origins:
    origin = origin.strip()
    if not origin:
        continue

    if not origin.startswith("http://") and not origin.startswith("https://"):
        origin = "http://" + origin

    CORS_ALLOWED_ORIGINS.append(origin)
    CSRF_TRUSTED_ORIGINS.append(origin)

# Extra CSRF trusted origins from env (for Cloud Run, etc.)
extra_csrf = os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
for origin in extra_csrf:
    origin = origin.strip()
    if origin:
        if not origin.startswith("http://") and not origin.startswith("https://"):
            origin = "https://" + origin
        CSRF_TRUSTED_ORIGINS.append(origin)

# ==========================
# Cloudinary
# ==========================
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.getenv("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": os.getenv("CLOUDINARY_API_KEY"),
    "API_SECRET": os.getenv("CLOUDINARY_API_SECRET"),
}

DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

# ==========================
# Django REST Framework
# ==========================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
}

# ==========================
# JWT Settings
# ==========================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=200),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# ==========================
# Password Validation
# ==========================
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "exam_project.accounts.validators.CustomUserAttributeSimilarityValidator",
        "OPTIONS": {
            "user_attributes": ("email",),
        },
    },
    {
        "NAME": "exam_project.accounts.validators.CustomMinimumLengthValidator",
        "OPTIONS": {
            "min_length": 8,
        },
    },
    {
        "NAME": "exam_project.accounts.validators.CustomCommonPasswordValidator",
    },
    {
        "NAME": "exam_project.accounts.validators.CustomNumericPasswordValidator",
    },
]

# ==========================
# Internationalization
# ==========================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ==========================
# Static & Media Files
# ==========================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"

STATICFILES_DIRS = [
    BASE_DIR / "staticfiles",
]

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "mediafiles"

# ==========================
# Authentication
# ==========================
AUTH_USER_MODEL = "accounts.AppUser"
LOGIN_REDIRECT_URL = reverse_lazy("index")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
