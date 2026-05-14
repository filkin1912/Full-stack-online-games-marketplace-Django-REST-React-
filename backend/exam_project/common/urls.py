from django.urls import path, include
from exam_project.common.views import delete_comment

urlpatterns = [
    path('delete/<int:pk>/', delete_comment, name='delete comment'),
]
