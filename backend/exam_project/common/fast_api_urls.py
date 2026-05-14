from fastapi import APIRouter

from exam_project.common.fast_common import router as common_router


fast_api_router = APIRouter()
fast_api_router.include_router(common_router)
