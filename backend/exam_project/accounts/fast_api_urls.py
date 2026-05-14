from fastapi import APIRouter

from exam_project.accounts.fast_accounts import router as accounts_router, login_user
from exam_project.games.fast_games import router as games_router

fast_api_router = APIRouter()

# /fast/api/accounts/...
fast_api_router.include_router(accounts_router)

# /fast/api/games/...
fast_api_router.include_router(games_router)

# Expose login at /fast/api/auth/token/ (what React calls)
fast_api_router.add_api_route(
    "/fast/api/auth/token/",
    login_user,
    methods=["POST"],
    name="fast-login",
)
