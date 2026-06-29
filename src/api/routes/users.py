from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
import urllib.request
import json
import uuid
from src.core.config import settings
from src.core.ws_manager import manager
from src.api.dependencies import get_db, get_current_active_user
from src.schemas.user import UserCreate, UserRead, UserUpdate, UsernameAvailability, Token, GoogleLoginInput
from src.models.user import User
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

@router.post("/login/google", response_model=Token)
async def login_google(
    login_in: GoogleLoginInput,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Login or register using a Google ID token."""
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={login_in.id_token}"
        req = urllib.request.Request(url, method="GET")
        
        from fastapi.concurrency import run_in_threadpool
        
        def fetch_token_info():
            with urllib.request.urlopen(req, timeout=5) as response:
                return json.loads(response.read().decode("utf-8"))
        
        info = await run_in_threadpool(fetch_token_info)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Google token: {str(e)}"
        )
    
    aud = info.get("aud")
    if aud != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token audience mismatch"
        )
    
    email = info.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email missing from Google ID token claims"
        )
        
    user = await user_repo.get_by_email(db, email=email)
    if not user:
        base_username = email.split("@")[0]
        username = "".join(c for c in base_username if c.isalnum() or c in "._-")
        if not username:
            username = "google_user"
        
        existing_user = await user_repo.get_by_username(db, username=username)
        if existing_user:
            username = f"{username}_{uuid.uuid4().hex[:6]}"
            
        user_create = UserCreate(
            email=email,
            username=username,
            phone="Not provided",
            address="Registered via Google",
            password=uuid.uuid4().hex,
            is_active=True,
            is_admin=False
        )
        user = await user_repo.create(db, obj_in=user_create)
        await manager.broadcast_to_admins({"type": "user_signed_up", "message": f"New user signed up via Google: {user.email}"})
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
async def read_user_me(
    current_user: UserRead = Depends(get_current_active_user)
) -> Any:
    """Get current user."""
    return current_user

@router.patch("/me", response_model=UserRead)
async def update_user_me(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update the current user's own profile (email, phone, address, password)."""
    return await user_service.update_own_profile(db, current_user, user_in)

@router.get("/check-username", response_model=UsernameAvailability)
async def check_username(
    username: str,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Check whether a username is available, with alternative suggestions if not."""
    available = await user_service.check_username_available(db, username)
    suggestions = [] if available else await user_service.suggest_usernames(db, username)
    return UsernameAvailability(available=available, suggestions=suggestions)
