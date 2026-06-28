from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from src.api.dependencies import get_db, get_current_active_user
from src.schemas.brand import BrandCreate, BrandRead
from src.services.brand import brand_service
from src.models.user import User

router = APIRouter()

@router.post("/", response_model=BrandRead, status_code=status.HTTP_201_CREATED)
async def create_brand(
    brand_in: BrandCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Register a new brand owned by the current user."""
    return await brand_service.create_for_user(db, brand_in, owner=current_user)

@router.get("/me", response_model=List[BrandRead])
async def read_my_brands(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """List brands registered by the current user."""
    return await brand_service.get_by_owner(db, owner_id=current_user.id)
