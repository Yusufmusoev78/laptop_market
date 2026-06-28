from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.repositories.base import BaseRepository
from src.models.order import Order
from src.schemas.order import OrderCreate, OrderUpdate

class OrderRepository(BaseRepository[Order, OrderCreate, OrderUpdate]):
    async def get_by_user(self, db: AsyncSession, *, user_id: int) -> List[Order]:
        query = (
            select(Order)
            .where(Order.user_id == user_id)
            .options(selectinload(Order.laptop))
            .order_by(Order.created_at.desc())
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_all_with_relations(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[Order]:
        query = (
            select(Order)
            .options(selectinload(Order.laptop), selectinload(Order.user))
            .offset(skip)
            .limit(limit)
            .order_by(Order.created_at.desc())
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_with_relations(self, db: AsyncSession, *, order_id: int) -> Optional[Order]:
        query = (
            select(Order)
            .where(Order.id == order_id)
            .options(selectinload(Order.laptop), selectinload(Order.user))
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

order_repo = OrderRepository(Order)
