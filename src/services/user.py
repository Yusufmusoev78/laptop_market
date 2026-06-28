import random
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.user import user_repo
from src.schemas.user import AdminUserUpdate, UserCreate, UserUpdate
from src.core.exceptions import BadRequestException, NotFoundException
from src.core.security import get_password_hash
from src.core.ws_manager import manager
from src.models.user import User

class UserService:
    async def create_user(self, db: AsyncSession, user_in: UserCreate) -> User:
        user = await user_repo.get_by_email(db, email=user_in.email)
        if user:
            raise BadRequestException("User with this email already exists")
        existing_username = await user_repo.get_by_username(db, username=user_in.username)
        if existing_username:
            raise BadRequestException("Username is already taken")
        user = await user_repo.create(db, obj_in=user_in)
        await manager.broadcast_to_admins({"type": "user_signed_up", "message": f"New user signed up: {user.email}"})
        return user

    async def check_username_available(self, db: AsyncSession, username: str) -> bool:
        existing = await user_repo.get_by_username(db, username=username)
        return existing is None

    async def suggest_usernames(self, db: AsyncSession, username: str, count: int = 3) -> List[str]:
        suggestions: List[str] = []
        candidates = [f"{username}{n}" for n in range(1, 10)] + [f"{username}_{random.randint(100, 999)}" for _ in range(5)]
        for candidate in candidates:
            if len(suggestions) >= count:
                break
            if await self.check_username_available(db, candidate):
                suggestions.append(candidate)
        return suggestions

    async def update_own_profile(self, db: AsyncSession, current_user: User, update_in: UserUpdate) -> User:
        if update_in.email and update_in.email != current_user.email:
            existing = await user_repo.get_by_email(db, email=update_in.email)
            if existing:
                raise BadRequestException("User with this email already exists")
        update_data = update_in.model_dump(exclude_unset=True, exclude={"password"})
        if update_in.password:
            update_data["hashed_password"] = get_password_hash(update_in.password)
        return await user_repo.update(db, db_obj=current_user, obj_in=update_data)

    async def get_user_by_id(self, db: AsyncSession, user_id: int) -> User:
        user = await user_repo.get(db, id=user_id)
        if not user:
            raise NotFoundException("User")
        return user

    async def get_all_users(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[User]:
        return await user_repo.get_multi(db, skip=skip, limit=limit)

    async def update_user_admin(
        self, db: AsyncSession, user_id: int, update_in: AdminUserUpdate, current_user: User
    ) -> User:
        if user_id == current_user.id:
            raise BadRequestException("You cannot change your own admin status or activation through this endpoint")
        user = await self.get_user_by_id(db, user_id)
        return await user_repo.update(db, db_obj=user, obj_in=update_in)

    async def delete_user(self, db: AsyncSession, user_id: int, current_user: User) -> User:
        if user_id == current_user.id:
            raise BadRequestException("You cannot delete your own account through this endpoint")
        user = await self.get_user_by_id(db, user_id)
        return await user_repo.remove(db, id=user.id)

user_service = UserService()
