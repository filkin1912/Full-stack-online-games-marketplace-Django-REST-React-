from django.urls import path
from exam_project.accounts.views import (
    SignUpView,
    SignInView,
    SignOutView,
    ProfileDetailsView,
    ProfileDeleteView,
    ProfileEditView
)

urlpatterns = (
    path('create/', SignUpView.as_view(), name='profile create'),
    path('login/', SignInView.as_view(), name='profile login'),
    path('logout/', SignOutView.as_view(), name='profile logout'),
    path('details/<int:pk>/', ProfileDetailsView.as_view(), name='profile details'),
    path('edit/<int:pk>/', ProfileEditView.as_view(), name='profile edit'),
    path('delete/<int:pk>/', ProfileDeleteView.as_view(), name='profile delete'),
)
