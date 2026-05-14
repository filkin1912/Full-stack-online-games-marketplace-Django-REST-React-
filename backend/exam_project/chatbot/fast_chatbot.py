from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/fast/api/chatbot",
    tags=["fast-chatbot"],
)


# ---------- Pydantic models ----------

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


# ---------- Endpoints ----------

# DRF: POST /api/chatbot/
@router.post("/", response_model=ChatResponse)
async def chatbot_reply(data: ChatRequest):
    # TODO: integrate your chatbot logic
    return ChatResponse(reply=f"Echo: {data.message}")


# DRF: POST /api/chatbot/clear/
@router.post("/clear/")
async def clear_chat():
    # TODO: implement memory clearing
    return {"status": "cleared"}
