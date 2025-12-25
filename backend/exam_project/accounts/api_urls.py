from django.urls import path
from .api_views import (
    MeRetrieveUpdateApiView,
    UsersListApiView,
    UserDetailApiView,
    SignUpApiView,
    DeleteUserApiView,
)

urlpatterns = [
    path('me/', MeRetrieveUpdateApiView.as_view(), name='accounts_me'),
    path('users/', UsersListApiView.as_view(), name='accounts_users'),
    path('users/<int:pk>/', UserDetailApiView.as_view(), name='accounts_user_detail'),
    path('signup/', SignUpApiView.as_view(), name='accounts_signup'),
    path('delete/<int:pk>/', DeleteUserApiView.as_view(), name='accounts_delete'),
]
