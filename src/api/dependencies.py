from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError
from src.core.config import settings
from src.core.exceptions import CredentialsException
from src.db.session import get_db
from src.models.user import User
from src.services.user import user_service
from src.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/users/login")

async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise CredentialsException()
        token_data = TokenData(email=email)
    except JWTError:
        raise CredentialsException()
    
    from src.repositories.user import user_repo
    user = await user_repo.get_by_email(db, email=token_data.email)
    if user is None:
        raise CredentialsException()
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise CredentialsException()
    return current_user

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise CredentialsException()
    return current_user
