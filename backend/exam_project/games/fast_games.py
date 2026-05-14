from datetime import datetime
import random
from decimal import Decimal
from typing import List, Optional

from asgiref.sync import sync_to_async
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.db import IntegrityError, transaction
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from exam_project.accounts.fast_accounts import AppUser, get_current_user
from exam_project.common.models import BoughtGame
from exam_project.games.models import GameModel

router = APIRouter(
    prefix="/fast/api/games",
    tags=["fast-games"],
)


# ---------- Pydantic models ----------

class FastGameOut(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    price: float
    category: str
    game_picture: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[int] = None
    ownerEmail: Optional[str] = None
    seller_display: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Helpers ----------

async def get_game_or_404(pk: int) -> GameModel:
    game = await sync_to_async(GameModel.objects.select_related("user").filter(pk=pk).first)()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


def serialize_game(game: GameModel) -> FastGameOut:
    game_picture_url = None
    if game.game_picture:
        game_picture_url = getattr(game.game_picture, "url", None) or str(game.game_picture)

    return FastGameOut(
        id=game.id,
        title=game.title,
        summary=game.summary,
        price=float(game.price),
        category=game.category,
        game_picture=game_picture_url,
        created_at=game.created_at,
        user=game.user_id,
        ownerEmail=game.user.email if game.user else None,
        seller_display=getattr(game.user, "display_name", None) if game.user else None,
    )


# ---------- Endpoints ----------

@router.get("/", response_model=List[FastGameOut])
async def list_games(page: int = 1):
    games = await sync_to_async(list)(GameModel.objects.select_related("user").all())
    return [serialize_game(g) for g in games]


@router.post("/", response_model=FastGameOut, status_code=status.HTTP_201_CREATED)
async def create_game(
    title: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    summary: Optional[str] = Form(None),
    game_picture: Optional[UploadFile] = File(None),
    user: AppUser = Depends(get_current_user),
):
    uploaded_file = None
    if game_picture:
        content = await game_picture.read()
        if content:
            uploaded_file = SimpleUploadedFile(
                name=game_picture.filename or "game-picture",
                content=content,
                content_type=game_picture.content_type or "application/octet-stream",
            )

    def _create():
        try:
            return GameModel.objects.create(
                title=title,
                summary=summary,
                price=price,
                category=category,
                game_picture=uploaded_file,
                user=user,
            )
        except IntegrityError:
            raise HTTPException(status_code=400, detail="A game with this title already exists.")

    game = await sync_to_async(_create)()
    game = await sync_to_async(lambda: GameModel.objects.select_related("user").get(pk=game.pk))()
    return serialize_game(game)


@router.get("/{pk:int}/", response_model=FastGameOut)
async def retrieve_game(pk: int):
    game = await get_game_or_404(pk)
    return serialize_game(game)


@router.put("/{pk:int}/", response_model=FastGameOut)
@router.patch("/{pk:int}/", response_model=FastGameOut)
async def update_game(
    pk: int,
    title: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    summary: Optional[str] = Form(None),
    game_picture: Optional[UploadFile] = File(None),
    user: AppUser = Depends(get_current_user),
):
    game = await get_game_or_404(pk)
    if game.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can edit only your own games.")

    uploaded_file = None
    if game_picture:
        content = await game_picture.read()
        if content:
            uploaded_file = SimpleUploadedFile(
                name=game_picture.filename or "game-picture",
                content=content,
                content_type=game_picture.content_type or "application/octet-stream",
            )

    def _update():
        try:
            game.title = title
            game.category = category
            game.price = price
            game.summary = summary
            if uploaded_file is not None:
                game.game_picture = uploaded_file
            game.save()
            return game
        except IntegrityError:
            raise HTTPException(status_code=400, detail="A game with this title already exists.")

    updated = await sync_to_async(_update)()
    updated = await sync_to_async(lambda: GameModel.objects.select_related("user").get(pk=updated.pk))()
    return serialize_game(updated)


@router.delete("/{pk:int}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game(pk: int, user: AppUser = Depends(get_current_user)):
    game = await get_game_or_404(pk)
    if game.user_id != user.id:
        raise HTTPException(status_code=403, detail="You can delete only your own games.")
    await sync_to_async(game.delete)()
    return


@router.get("/mine/", response_model=List[FastGameOut])
async def my_games(user: AppUser = Depends(get_current_user)):
    games = await sync_to_async(list)(
        GameModel.objects.select_related("user").filter(user=user).order_by("-id")
    )
    return [serialize_game(g) for g in games]


@router.post("/{pk:int}/buy/", response_model=FastGameOut, status_code=status.HTTP_201_CREATED)
async def buy_game(pk: int, user: AppUser = Depends(get_current_user)):
    def _buy():
        with transaction.atomic():
            game = GameModel.objects.select_for_update().filter(pk=pk).first()
            if not game:
                raise HTTPException(status_code=404, detail="Game not found.")

            buyer = AppUser.objects.select_for_update().get(pk=user.id)

            if game.user_id == buyer.id:
                raise HTTPException(status_code=400, detail="You cannot buy your own game.")

            if BoughtGame.objects.filter(user=buyer, game=game).exists():
                raise HTTPException(status_code=400, detail="Already purchased.")

            if buyer.money < game.price:
                raise HTTPException(status_code=400, detail="Insufficient funds.")

            buyer.money -= game.price
            buyer.save(update_fields=["money"])

            seller = game.user
            if seller is not None:
                seller.money += game.price
                seller.save(update_fields=["money"])

            BoughtGame.objects.create(user=buyer, game=game)
            return game

    game = await sync_to_async(_buy)()
    game = await sync_to_async(lambda: GameModel.objects.select_related("user").get(pk=game.pk))()
    return serialize_game(game)


@router.get("/bought-games/", response_model=List[FastGameOut])
async def bought_games(user: AppUser = Depends(get_current_user)):
    games = await sync_to_async(list)(
        GameModel.objects.select_related("user")
        .filter(boughtgame__user=user)
        .order_by("-id")
        .distinct()
    )
    return [serialize_game(g) for g in games]


@router.post("/seed/", status_code=status.HTTP_201_CREATED)
async def seed_games(user: AppUser = Depends(get_current_user)):
    categories = [c[0] for c in GameModel._meta.get_field("category").choices]
    now = datetime.now().strftime("%Y%m%d-%H%M%S")

    def _seed():
        GameModel.objects.bulk_create([
            GameModel(
                title=f"Game {i} - {now}"[:24],
                category=random.choice(categories),
                price=Decimal(random.randrange(100, 280)),
                summary="Auto-generated",
                user=user,
            )
            for i in range(1, 21)
        ])

    await sync_to_async(_seed)()
    return JSONResponse(
        content={"detail": "20 games created successfully."},
        status_code=status.HTTP_201_CREATED,
    )


@router.post("/load/")
async def load_games(user: AppUser = Depends(get_current_user)):
    if await sync_to_async(GameModel.objects.exists)():
        return JSONResponse(
            content={"detail": "Games already exist. Loading skipped."},
            status_code=status.HTTP_200_OK,
        )

    await sync_to_async(call_command)("loaddata", "initial_games.json")
    return JSONResponse(
        content={"detail": "Initial games loaded successfully."},
        status_code=status.HTTP_201_CREATED,
    )
