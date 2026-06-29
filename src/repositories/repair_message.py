from typing import List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.repositories.base import BaseRepository
from src.models.repair_message import RepairMessage
from src.schemas.repair_message import RepairMessageCreate

class RepairMessageRepository(BaseRepository[RepairMessage, RepairMessageCreate, Any]):
    async def get_by_repair(self, db: AsyncSession, *, repair_id: int) -> List[RepairMessage]:
        query = select(RepairMessage).where(RepairMessage.repair_id == repair_id).order_by(RepairMessage.created_at.asc())
        result = await db.execute(query)
        return result.scalars().all()

repair_message_repo = RepairMessageRepository(RepairMessage)
