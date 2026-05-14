from datetime import datetime
from typing import List, Optional

from asgiref.sync import sync_to_async
from fastapi import APIRouter, Depends, Form, HTTPException, status
from pydantic import BaseModel

from exam_project.accounts.fast_accounts import AppUser, get_current_user
from exam_project.common.models import GameComment
from exam_project.games.models import GameModel

router = APIRouter(
    prefix="/fast/api/common",
    tags=["fast-common"],
)


# ---------- Pydantic models ----------

class FastCommentOut(BaseModel):
    id: int
    text: str
    user_email: str
    profile_picture: Optional[str] = None
    game_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Helpers ----------

async def get_comment_or_404(pk: int) -> GameComment:
    comment = await sync_to_async(GameComment.objects.select_related("user").filter(pk=pk).first)()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


def serialize_comment(comment: GameComment) -> FastCommentOut:
    profile_picture = None
    if getattr(comment, "profile_picture", None):
        profile_picture = getattr(comment.profile_picture, "url", None) or str(comment.profile_picture)

    return FastCommentOut(
        id=comment.id,
        text=comment.text,
        user_email=comment.user.email,
        profile_picture=profile_picture,
        game_id=comment.game_id,
        created_at=comment.created_at,
    )


# ---------- Endpoints ----------

# DRF: GET/POST /api/common/comments/<game_id>/
@router.get("/comments/{game_id}/", response_model=List[FastCommentOut])
async def list_comments(game_id: int):
    comments = await sync_to_async(list)(
        GameComment.objects.select_related("user").filter(game_id=game_id).order_by("created_at")
    )
    return [serialize_comment(c) for c in comments]


@router.post("/comments/{game_id}/", response_model=FastCommentOut)
async def create_comment(
    game_id: int,
    text: str = Form(...),
    user: AppUser = Depends(get_current_user),
):
    game_exists = await sync_to_async(GameModel.objects.filter(pk=game_id).exists)()
    if not game_exists:
        raise HTTPException(status_code=404, detail="Game not found")

    def _create():
        # Mirrors DRF unique constraint behavior: one comment per user per game.
        if GameComment.objects.filter(game_id=game_id, user=user).exists():
            raise HTTPException(status_code=400, detail="You have already commented on this game.")

        return GameComment.objects.create(
            text=text,
            game_id=game_id,
            user=user,
            profile_picture=user.profile_picture,
        )

    comment = await sync_to_async(_create)()
    comment = await sync_to_async(lambda: GameComment.objects.select_related("user").get(pk=comment.pk))()
    return serialize_comment(comment)


# DRF: DELETE /api/common/comments/delete/<pk>/
@router.delete("/comments/delete/{pk}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(pk: int, user: AppUser = Depends(get_current_user)):
    comment = await get_comment_or_404(pk)
    if comment.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can delete only your comments.")
    await sync_to_async(comment.delete)()
    return
