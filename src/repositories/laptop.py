from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.repositories.base import BaseRepository
from src.models.laptop import Laptop
from src.schemas.laptop import LaptopCreate, LaptopUpdate

class LaptopRepository(BaseRepository[Laptop, LaptopCreate, LaptopUpdate]):
    async def create_with_owner(
        self, db: AsyncSession, *, obj_in: LaptopCreate, owner_id: int, brand_name: str
    ) -> Laptop:
        db_obj = Laptop(**obj_in.model_dump(), owner_id=owner_id, brand=brand_name)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_by_owner(self, db: AsyncSession, *, owner_id: int) -> List[Laptop]:
        query = select(Laptop).where(Laptop.owner_id == owner_id)
        result = await db.execute(query)
        return result.scalars().all()

laptop_repo = LaptopRepository(Laptop)
