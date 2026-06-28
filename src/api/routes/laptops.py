from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from src.api.dependencies import get_db, get_current_active_user
from src.schemas.laptop import LaptopCreate, LaptopRead, LaptopUpdate
from src.schemas.sale import SaleCreate
from src.services.laptop import laptop_service
from src.models.user import User

router = APIRouter()

@router.get("/", response_model=List[LaptopRead])
async def read_laptops(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Retrieve laptops."""
    return await laptop_service.get_all(db, skip=skip, limit=limit)

@router.get("/me", response_model=List[LaptopRead])
async def read_my_laptops(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retrieve laptops listed by the current user."""
    return await laptop_service.get_by_owner(db, owner_id=current_user.id)

@router.post("/", response_model=LaptopRead, status_code=status.HTTP_201_CREATED)
async def create_laptop(
    laptop_in: LaptopCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create a new laptop listing under the current user's brand."""
    return await laptop_service.create_for_user(db, laptop_in, owner=current_user)

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
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update a laptop (owner or admin only)."""
    return await laptop_service.update(db, id, laptop_in, current_user)

@router.delete("/{id}", response_model=LaptopRead)
async def delete_laptop(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete a laptop (owner or admin only)."""
    return await laptop_service.delete(db, id, current_user)

@router.post("/{id}/sales", response_model=LaptopRead)
async def record_laptop_sale(
    id: int,
    sale_in: SaleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Record a sale for a laptop (owner or admin only); decrements stock."""
    return await laptop_service.record_sale(db, id, sale_in.quantity, current_user)
