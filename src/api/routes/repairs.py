from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from src.api.dependencies import get_db
from src.schemas.repair import RepairCreate, RepairRead
from src.services.repair import repair_service

router = APIRouter()

@router.post("/", response_model=RepairRead, status_code=status.HTTP_201_CREATED)
async def create_repair_request(
    *,
    db: AsyncSession = Depends(get_db),
    obj_in: RepairCreate
) -> Any:
    """Create a new repair request."""
    return await repair_service.create(db, obj_in=obj_in)

@router.get("/", response_model=List[RepairRead])
async def read_repair_requests(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Retrieve repair requests."""
    return await repair_service.get_all(db, skip=skip, limit=limit)
