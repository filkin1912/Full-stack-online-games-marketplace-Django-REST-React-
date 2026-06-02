from fastapi import APIRouter

from exam_project.accounts.fast_accounts import (
    router as accounts_router,
    login_user,
    refresh_token,
    verify_token,
)
from exam_project.chatbot.fast_chatbot import router as chatbot_router
from exam_project.common.fast_common import router as common_router
from exam_project.games.fast_games import router as games_router

fast_api_router = APIRouter()

# /api/accounts/...
fast_api_router.include_router(accounts_router)

# /api/games/...
fast_api_router.include_router(games_router)

# /api/common/...
fast_api_router.include_router(common_router)

# /api/chatbot/...
fast_api_router.include_router(chatbot_router)

# Auth routes kept at /api/auth/* for frontend compatibility.
fast_api_router.add_api_route(
    "/api/auth/token/",
    login_user,
    methods=["POST"],
    name="token_obtain_pair",
)
fast_api_router.add_api_route(
    "/api/auth/token/refresh/",
    refresh_token,
    methods=["POST"],
    name="token_refresh",
)
fast_api_router.add_api_route(
    "/api/auth/token/verify/",
    verify_token,
    methods=["POST"],
    name="token_verify",
)

