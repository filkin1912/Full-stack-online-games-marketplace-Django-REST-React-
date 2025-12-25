from django.urls import path
from exam_project.common.api_views import CommentListCreateApiView, CommentDeleteApiView

urlpatterns = [
    path("comments/<int:game_id>/", CommentListCreateApiView.as_view(), name="comment_list_create"),
    path("comments/delete/<int:pk>/", CommentDeleteApiView.as_view(), name="comment_delete"),
]
