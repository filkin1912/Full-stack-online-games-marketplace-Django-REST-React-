from fastapi import APIRouter

from exam_project.chatbot.fast_chatbot import router as chatbot_router


fast_api_router = APIRouter()
fast_api_router.include_router(chatbot_router)
