from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.repositories.base import BaseRepository
from src.models.brand import Brand
from src.schemas.brand import BrandCreate

class BrandRepository(BaseRepository[Brand, BrandCreate, BrandCreate]):
    async def create_with_owner(self, db: AsyncSession, *, obj_in: BrandCreate, owner_id: int) -> Brand:
        db_obj = Brand(**obj_in.model_dump(), owner_id=owner_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_by_owner(self, db: AsyncSession, *, owner_id: int) -> List[Brand]:
        query = select(Brand).where(Brand.owner_id == owner_id)
        result = await db.execute(query)
        return result.scalars().all()

brand_repo = BrandRepository(Brand)
