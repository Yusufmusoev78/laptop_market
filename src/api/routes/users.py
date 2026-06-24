from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
from src.api.dependencies import get_db, get_current_active_user
from src.schemas.user import UserCreate, UserRead, Token
from src.services.user import user_service
from src.repositories.user import user_repo
from src.core.security import verify_password, create_access_token
from src.core.exceptions import CredentialsException

router = APIRouter()

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Create a new user."""
    return await user_service.create_user(db, user_in)

@router.post("/login", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests."""
    user = await user_repo.get_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise CredentialsException()
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
async def read_user_me(
    current_user: UserRead = Depends(get_current_active_user)
) -> Any:
    """Get current user."""
    return current_user
