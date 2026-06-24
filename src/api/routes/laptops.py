from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from src.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from src.schemas.laptop import LaptopCreate, LaptopRead, LaptopUpdate
from src.services.laptop import laptop_service
from src.schemas.user import UserRead

router = APIRouter()

@router.get("/", response_model=List[LaptopRead])
async def read_laptops(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Retrieve laptops."""
    return await laptop_service.get_all(db, skip=skip, limit=limit)

@router.post("/", response_model=LaptopRead, status_code=status.HTTP_201_CREATED)
async def create_laptop(
    laptop_in: LaptopCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserRead = Depends(get_current_admin_user)
) -> Any:
    """Create new laptop (Admin only)."""
    return await laptop_service.create(db, laptop_in)

@router.get("/{id}", response_model=LaptopRead)
async def read_laptop(
    id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get laptop by ID."""
    return await laptop_service.get_by_id(db, id)

@router.put("/{id}", response_model=LaptopRead)
async def update_laptop(
    id: int,
    laptop_in: LaptopUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserRead = Depends(get_current_admin_user)
) -> Any:
    """Update a laptop (Admin only)."""
    return await laptop_service.update(db, id, laptop_in)

@router.delete("/{id}", response_model=LaptopRead)
async def delete_laptop(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserRead = Depends(get_current_admin_user)
) -> Any:
    """Delete a laptop (Admin only)."""
    return await laptop_service.delete(db, id)
