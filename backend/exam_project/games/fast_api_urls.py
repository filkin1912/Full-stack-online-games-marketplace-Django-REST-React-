from fastapi import APIRouter

from exam_project.games.fast_games import router as games_router


fast_api_router = APIRouter()
fast_api_router.include_router(games_router)

