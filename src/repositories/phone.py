from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.repositories.base import BaseRepository
from src.models.phone import Phone
from src.schemas.phone import PhoneCreate, PhoneUpdate

class PhoneRepository(BaseRepository[Phone, PhoneCreate, PhoneUpdate]):
    async def create_with_owner(
        self, db: AsyncSession, *, obj_in: PhoneCreate, owner_id: int, brand_name: str
    ) -> Phone:
        db_obj = Phone(**obj_in.model_dump(), owner_id=owner_id, brand=brand_name)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_by_owner(self, db: AsyncSession, *, owner_id: int) -> List[Phone]:
        query = select(Phone).where(Phone.owner_id == owner_id)
        result = await db.execute(query)
        return result.scalars().all()

phone_repo = PhoneRepository(Phone)
