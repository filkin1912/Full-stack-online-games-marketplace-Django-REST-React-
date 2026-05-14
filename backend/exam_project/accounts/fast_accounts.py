from typing import Optional, List

from asgiref.sync import sync_to_async
from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel, EmailStr
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken

from exam_project.accounts.models import AppUser

router = APIRouter(
    prefix="/fast/api/accounts",
    tags=["fast-accounts"],
)


# ---------- Pydantic models ----------

class FastUserOut(BaseModel):
    id: int
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    money: int

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


# ---------- Helpers ----------

async def get_user_or_404(pk: int) -> AppUser:
    user = await sync_to_async(AppUser.objects.filter(pk=pk).first)()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def get_current_user(authorization: str = Header(None)) -> AppUser:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = AccessToken(token)
        user_id = payload["user_id"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await sync_to_async(AppUser.objects.filter(pk=user_id).first)()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ---------- JWT LOGIN ----------

@router.post("/auth/token/", response_model=FastTokenOut)
async def login_user(data: FastLoginIn) -> FastTokenOut:
    # USERNAME_FIELD = "email" → authenticate with email
    user = await sync_to_async(authenticate)(email=data.email, password=data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    refresh = RefreshToken.for_user(user)

    return FastTokenOut(
        access=str(refresh.access_token),
        refresh=str(refresh),
    )


# ---------- SIGNUP ----------

@router.post("/signup/", response_model=FastUserOut, status_code=status.HTTP_201_CREATED)
async def signup_user(data: FastUserCreateIn) -> FastUserOut:
    def _create():
        return AppUser.objects.create_user(
            email=data.email,
            password=data.password,
            first_name=data.first_name or "",
            last_name=data.last_name or "",
        )

    user = await sync_to_async(_create)()
    return FastUserOut.model_validate(user)


# ---------- ME ----------

@router.get("/me/", response_model=FastUserOut)
async def get_me(user: AppUser = Depends(get_current_user)):
    return FastUserOut.model_validate(user)


# ---------- USERS ----------

@router.get("/users/", response_model=List[FastUserOut])
async def list_users() -> List[FastUserOut]:
    users = await sync_to_async(list)(
        AppUser.objects.all().values("id", "email", "first_name", "last_name", "money")
    )
    return [FastUserOut(**u) for u in users]


@router.get("/users/{pk}/", response_model=FastUserDetailOut)
async def retrieve_user(pk: int) -> FastUserDetailOut:
    user = await get_user_or_404(pk)
    return FastUserDetailOut.model_validate(user)


@router.delete("/delete/{pk}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(pk: int):
    user = await get_user_or_404(pk)
    await sync_to_async(user.delete)()
    return
