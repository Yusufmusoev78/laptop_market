from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.repositories.repair import repair_repo
from src.repositories.repair_message import repair_message_repo
from src.schemas.repair import RepairCreate
from src.models.repair import RepairRequest
from src.models.repair_message import RepairMessage
from src.core.exceptions import NotFoundException
from typing import List

class RepairService:
    async def create(self, db: AsyncSession, *, obj_in: RepairCreate, client_id: int) -> RepairRequest:
        obj_in.client_id = client_id
        return await repair_repo.create(db, obj_in=obj_in)

    async def get_repair_by_id(self, db: AsyncSession, *, repair_id: int) -> RepairRequest:
        repair = await repair_repo.get(db, id=repair_id)
        if not repair:
            raise NotFoundException("Repair request not found")
        return repair

    async def get_by_client(self, db: AsyncSession, *, client_id: int) -> List[RepairRequest]:
        query = select(RepairRequest).where(RepairRequest.client_id == client_id).order_by(RepairRequest.created_at.desc())
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_usto(self, db: AsyncSession, *, usto_id: int) -> List[RepairRequest]:
        query = select(RepairRequest).where(RepairRequest.usto_id == usto_id).order_by(RepairRequest.created_at.desc())
        result = await db.execute(query)
        return result.scalars().all()

    async def get_unclaimed(self, db: AsyncSession) -> List[RepairRequest]:
        query = select(RepairRequest).where(RepairRequest.usto_id == None).order_by(RepairRequest.created_at.desc())
        result = await db.execute(query)
        return result.scalars().all()

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[RepairRequest]:
        return await repair_repo.get_multi(db, skip=skip, limit=limit)

    async def claim_repair(self, db: AsyncSession, *, repair_id: int, usto_id: int) -> RepairRequest:
        repair = await self.get_repair_by_id(db, repair_id=repair_id)
        repair.usto_id = usto_id
        repair.status = "in_progress"
        db.add(repair)
        await db.commit()
        await db.refresh(repair)
        return repair

    async def add_message(
        self, db: AsyncSession, *, repair_id: int, sender_id: int, sender_name: str, message_text: str
    ) -> RepairMessage:
        db_obj = RepairMessage(
            repair_id=repair_id,
            sender_id=sender_id,
            sender_name=sender_name,
            message_text=message_text
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_messages(self, db: AsyncSession, *, repair_id: int) -> List[RepairMessage]:
        return await repair_message_repo.get_by_repair(db, repair_id=repair_id)

repair_service = RepairService()
