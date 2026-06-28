from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from src.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from src.schemas.order import OrderCreate, OrderRead, OrderUpdate
from src.models.user import User
from src.services.order import order_service

router = APIRouter()

@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def place_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Place a new order."""
    return await order_service.create_order(db, order_in, current_user)

@router.get("/me", response_model=List[OrderRead])
async def read_my_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retrieve orders placed by the current user."""
    return await order_service.get_by_user(db, user_id=current_user.id)

@router.get("/", response_model=List[OrderRead])
async def read_all_orders(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
) -> Any:
    """Retrieve all orders (admin only)."""
    return await order_service.get_all_admin(db, skip=skip, limit=limit)

@router.patch("/{id}", response_model=OrderRead)
async def update_order_status(
    id: int,
    status_in: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
) -> Any:
    """Update status of an order (admin only)."""
    return await order_service.update_status(db, order_id=id, status_in=status_in)
