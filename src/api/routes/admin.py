from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from src.api.dependencies import get_db, get_current_user
from src.schemas.user import AdminUserUpdate, UserRead
from src.services.user import user_service
from src.models.user import User

router = APIRouter()

@router.get("/users", response_model=List[UserRead])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """List all users (admin only)."""
    return await user_service.get_all_users(db, skip=skip, limit=limit)

@router.patch("/users/{id}", response_model=UserRead)
async def update_user(
    id: int,
    user_in: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Activate/deactivate a user or grant/revoke admin status."""
    return await user_service.update_user_admin(db, id, user_in, current_user)

@router.delete("/users/{id}", response_model=UserRead)
async def delete_user(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Delete a user account."""
    return await user_service.delete_user(db, id, current_user)
