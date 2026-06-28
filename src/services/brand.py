from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.brand import brand_repo
from src.schemas.brand import BrandCreate
from src.core.exceptions import ForbiddenException, NotFoundException
from src.core.ws_manager import manager
from src.models.brand import Brand
from src.models.user import User

class BrandService:
    async def create_for_user(self, db: AsyncSession, brand_in: BrandCreate, owner: User) -> Brand:
        brand = await brand_repo.create_with_owner(db, obj_in=brand_in, owner_id=owner.id)
        await manager.broadcast_to_admins({"type": "brand_registered", "message": f"New brand registered: {brand.name}"})
        return brand

    async def get_by_owner(self, db: AsyncSession, owner_id: int) -> List[Brand]:
        return await brand_repo.get_by_owner(db, owner_id=owner_id)

    async def get_by_id(self, db: AsyncSession, brand_id: int) -> Brand:
        brand = await brand_repo.get(db, id=brand_id)
        if not brand:
            raise NotFoundException("Brand")
        return brand

    async def get_owned_by_id(self, db: AsyncSession, brand_id: int, current_user: User) -> Brand:
        brand = await self.get_by_id(db, brand_id)
        if not current_user.is_admin and brand.owner_id != current_user.id:
            raise ForbiddenException("You can only list laptops under your own brand")
        return brand

brand_service = BrandService()
