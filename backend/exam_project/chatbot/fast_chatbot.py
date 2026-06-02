from asgiref.sync import sync_to_async
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from exam_project.accounts.fast_accounts import AppUser, get_current_user
from exam_project.games.models import GameModel
from .services import ask_llm, clear_memory

router = APIRouter(
    prefix="/api/chatbot",
    tags=["fast-chatbot"],
)


# ---------- Pydantic models ----------

class ChatRequest(BaseModel):
    """Input schema for the FastAPI chatbot endpoint."""
    message: str


class ChatResponse(BaseModel):
    """Output schema returned by the FastAPI chatbot endpoint."""
    reply: str


# ---------- Endpoints ----------

@router.post("/", response_model=ChatResponse)
async def chatbot_reply(data: ChatRequest, user: AppUser = Depends(get_current_user)):
    """Authenticated chatbot endpoint backed by chatbot services."""
    games = await sync_to_async(list)(
        GameModel.objects.all().values("title", "summary", "price", "category")
    )
    reply = await sync_to_async(ask_llm)(user=user, message=data.message, game_data=games)
    return ChatResponse(reply=reply)


@router.post("/clear/")
async def clear_chat(user: AppUser = Depends(get_current_user)):
    """Clear remembered chatbot preferences for the current user."""
    await sync_to_async(clear_memory)(user)
    return {"status": "cleared"}
