from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.laptop import laptop_repo
from src.schemas.laptop import LaptopCreate, LaptopUpdate
from src.core.exceptions import NotFoundException
from src.models.laptop import Laptop

class LaptopService:
    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Laptop]:
        return await laptop_repo.get_multi(db, skip=skip, limit=limit)
        
    async def get_by_id(self, db: AsyncSession, laptop_id: int) -> Laptop:
        laptop = await laptop_repo.get(db, id=laptop_id)
        if not laptop:
            raise NotFoundException("Laptop")
        return laptop

    async def create(self, db: AsyncSession, laptop_in: LaptopCreate) -> Laptop:
        return await laptop_repo.create(db, obj_in=laptop_in)

    async def update(self, db: AsyncSession, laptop_id: int, laptop_in: LaptopUpdate) -> Laptop:
        laptop = await self.get_by_id(db, laptop_id)
        return await laptop_repo.update(db, db_obj=laptop, obj_in=laptop_in)

    async def delete(self, db: AsyncSession, laptop_id: int) -> Laptop:
        laptop = await self.get_by_id(db, laptop_id)
        await laptop_repo.remove(db, id=laptop.id)
        return laptop

laptop_service = LaptopService()
