from django.urls import path
from .api_views import ChatbotAPIView, clear_chat_memory

urlpatterns = [
    path("", ChatbotAPIView.as_view(), name="chatbot-api"),
    path("clear/", clear_chat_memory, name="chatbot-clear"),
]
