from fastapi import APIRouter

from app.modules.contact.router import router as contact_router
from app.modules.discovery.router import router as discovery_router
from app.modules.discovery.workspace_router import router as workspace_router


api_router = APIRouter()
api_router.include_router(contact_router)
api_router.include_router(discovery_router)
api_router.include_router(workspace_router)
