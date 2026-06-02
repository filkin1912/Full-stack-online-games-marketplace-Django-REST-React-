from datetime import datetime, timedelta, timezone
from typing import Optional, List

import jwt
from asgiref.sync import sync_to_async
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from fastapi import APIRouter, HTTPException, status, Depends, Header, Form, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr

from exam_project.accounts.models import AppUser

router = APIRouter(
    prefix="/api/accounts",
    tags=["fast-accounts"],
)


# ---------- Pydantic models ----------

class FastUserOut(BaseModel):
    id: int
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    money: int
    profile_picture: Optional[str] = None
    games_count: int = 0

    class Config:
        from_attributes = True


class FastUserDetailOut(FastUserOut):
    pass


class FastUserCreateIn(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class FastLoginIn(BaseModel):
    email: EmailStr
    password: str


class FastTokenOut(BaseModel):
    access: str
    refresh: str


class FastTokenRefreshIn(BaseModel):
    refresh: str


class FastTokenVerifyIn(BaseModel):
    token: str


# ---------- Helpers ----------

async def get_user_or_404(pk: int) -> AppUser:
    user = await sync_to_async(AppUser.objects.filter(pk=pk).first)()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _profile_picture_url(user: AppUser) -> Optional[str]:
    if not getattr(user, "profile_picture", None):
        return None
    return getattr(user.profile_picture, "url", None) or str(user.profile_picture)


def serialize_user(user: AppUser, games_count: int = 0) -> FastUserOut:
    return FastUserOut(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        money=user.money,
        profile_picture=_profile_picture_url(user),
        games_count=games_count,
    )


def _decode_token(token: str, expected_type: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") != expected_type:
        raise HTTPException(status_code=401, detail=f"Invalid {expected_type} token")
    return payload


def _create_token(user_id: int, token_type: str, lifetime: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user_id,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + lifetime).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def _token_pair_for_user(user_id: int) -> FastTokenOut:
    access = _create_token(user_id, "access", timedelta(minutes=200))
    refresh = _create_token(user_id, "refresh", timedelta(days=7))
    return FastTokenOut(access=access, refresh=refresh)


async def get_current_user(authorization: str = Header(None)) -> AppUser:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.replace("Bearer ", "").strip()
    payload = _decode_token(token, expected_type="access")
    user_id = payload["user_id"]

    user = await sync_to_async(AppUser.objects.filter(pk=user_id).first)()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ---------- AUTH ----------

async def login_user(data: FastLoginIn) -> FastTokenOut:
    # USERNAME_FIELD = "email" → authenticate with email
    user = await sync_to_async(authenticate)(email=data.email, password=data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return _token_pair_for_user(user.id)


async def refresh_token(data: FastTokenRefreshIn) -> FastTokenOut:
    payload = _decode_token(data.refresh, expected_type="refresh")
    user_id = payload["user_id"]
    user_exists = await sync_to_async(AppUser.objects.filter(pk=user_id).exists)()
    if not user_exists:
        raise HTTPException(status_code=404, detail="User not found")
    return _token_pair_for_user(user_id)


async def verify_token(data: FastTokenVerifyIn):
    _decode_token(data.token, expected_type="access")
    return {"detail": "Token is valid"}


# ---------- SIGNUP ----------

@router.post("/signup/", response_model=FastUserOut, status_code=status.HTTP_201_CREATED)
async def signup_user(data: FastUserCreateIn) -> FastUserOut:
    try:
        validate_password(data.password)
    except ValidationError as exc:
        return JSONResponse(status_code=400, content={"password": exc.messages})

    email_exists = await sync_to_async(AppUser.objects.filter(email=data.email).exists)()
    if email_exists:
        return JSONResponse(
            status_code=400,
            content={"email": ["A user with that email already exists."]},
        )

    def _create():
        return AppUser.objects.create_user(
            email=data.email,
            password=data.password,
            first_name=data.first_name or "",
            last_name=data.last_name or "",
        )

    user = await sync_to_async(_create)()
    return serialize_user(user)


# ---------- ME ----------

@router.get("/me/", response_model=FastUserOut)
async def get_me(user: AppUser = Depends(get_current_user)):
    games_count = await sync_to_async(user.games.count)()
    return serialize_user(user, games_count=games_count)


@router.patch("/me/", response_model=FastUserOut)
async def update_me(
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    profile_picture: Optional[UploadFile] = File(None),
    user: AppUser = Depends(get_current_user),
):
    uploaded_file = None
    if profile_picture:
        content = await profile_picture.read()
        if content:
            uploaded_file = SimpleUploadedFile(
                name=profile_picture.filename or "profile-picture",
                content=content,
                content_type=profile_picture.content_type or "application/octet-stream",
            )

    def _update():
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if uploaded_file is not None:
            user.profile_picture = uploaded_file
        user.save()
        return user

    updated = await sync_to_async(_update)()
    games_count = await sync_to_async(updated.games.count)()
    return serialize_user(updated, games_count=games_count)


# ---------- USERS ----------

@router.get("/users/", response_model=List[FastUserOut])
async def list_users(user: AppUser = Depends(get_current_user)) -> List[FastUserOut]:
    if not user.is_staff:
        raise HTTPException(status_code=403, detail="Admin access required")

    def _collect():
        users = AppUser.objects.all()
        return [serialize_user(u, games_count=u.games.count()).model_dump() for u in users]

    rows = await sync_to_async(_collect)()
    return [FastUserOut(**row) for row in rows]


@router.get("/users/{pk}/", response_model=FastUserDetailOut)
async def retrieve_user(pk: int, user: AppUser = Depends(get_current_user)) -> FastUserDetailOut:
    if user.id != pk and not user.is_staff:
        raise HTTPException(status_code=403, detail="Not allowed")
    target_user = await get_user_or_404(pk)
    games_count = await sync_to_async(target_user.games.count)()
    return FastUserDetailOut(**serialize_user(target_user, games_count=games_count).model_dump())


@router.delete("/delete/{pk}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(pk: int, user: AppUser = Depends(get_current_user)):
    if user.id != pk and not user.is_staff:
        raise HTTPException(status_code=403, detail="Not allowed")
    target_user = await get_user_or_404(pk)
    await sync_to_async(target_user.delete)()
    return
