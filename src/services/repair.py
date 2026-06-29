from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.repair import repair_repo
from src.schemas.repair import RepairCreate
from src.models.repair import RepairRequest
from typing import List

class RepairService:
    async def create(self, db: AsyncSession, *, obj_in: RepairCreate) -> RepairRequest:
        return await repair_repo.create(db, obj_in=obj_in)

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[RepairRequest]:
        return await repair_repo.get_multi(db, skip=skip, limit=limit)

repair_service = RepairService()
