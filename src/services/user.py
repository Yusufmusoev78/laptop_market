from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.user import user_repo
from src.schemas.user import UserCreate, UserUpdate
from src.core.exceptions import BadRequestException, NotFoundException
from src.models.user import User

class UserService:
    async def create_user(self, db: AsyncSession, user_in: UserCreate) -> User:
        user = await user_repo.get_by_email(db, email=user_in.email)
        if user:
            raise BadRequestException("User with this email already exists")
        return await user_repo.create(db, obj_in=user_in)
        
    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> User:
        user = await user_repo.get(db, id=user_id)
        if not user:
            raise NotFoundException("User")
        return user

user_service = UserService()
