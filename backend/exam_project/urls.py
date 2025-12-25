from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView, TokenVerifyView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # REST API routes
    path('api/accounts/', include('exam_project.accounts.api_urls')),
    path('api/games/', include('exam_project.games.api_urls')),
    path('api/common/', include('exam_project.common.api_urls')),  # ← ADD THIS

    # Django template routes
    path('accounts/', include('exam_project.accounts.urls')),
    path('', include('exam_project.games.urls')),
    path('dashboard/', include('exam_project.common.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
