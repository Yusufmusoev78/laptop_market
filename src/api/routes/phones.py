from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from src.api.dependencies import get_db, get_current_active_user
from src.schemas.phone import PhoneCreate, PhoneRead, PhoneUpdate
from src.schemas.sale import SaleCreate
from src.services.phone import phone_service
from src.models.user import User

router = APIRouter()

@router.get("/", response_model=List[PhoneRead])
async def read_phones(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Retrieve phones."""
    return await phone_service.get_all(db, skip=skip, limit=limit)

@router.get("/me", response_model=List[PhoneRead])
async def read_my_phones(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retrieve phones listed by the current user."""
    return await phone_service.get_by_owner(db, owner_id=current_user.id)

@router.post("/", response_model=PhoneRead, status_code=status.HTTP_201_CREATED)
async def create_phone(
    phone_in: PhoneCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create a new phone listing under the current user's brand."""
    return await phone_service.create_for_user(db, phone_in, owner=current_user)

@router.get("/{id}", response_model=PhoneRead)
async def read_phone(
    id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get phone by ID."""
    return await phone_service.get_by_id(db, id)

@router.put("/{id}", response_model=PhoneRead)
async def update_phone(
    id: int,
    phone_in: PhoneUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update a phone (owner or admin only)."""
    return await phone_service.update(db, id, phone_in, current_user)

@router.delete("/{id}", response_model=PhoneRead)
async def delete_phone(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete a phone (owner or admin only)."""
    return await phone_service.delete(db, id, current_user)

@router.post("/{id}/sales", response_model=PhoneRead)
async def record_phone_sale(
    id: int,
    sale_in: SaleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Record a sale for a phone (owner or admin only); decrements stock."""
    return await phone_service.record_sale(db, id, sale_in.quantity, current_user)
