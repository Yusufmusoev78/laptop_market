from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.laptop import laptop_repo
from src.schemas.laptop import LaptopCreate, LaptopUpdate
from src.services.brand import brand_service
from src.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from src.core.ws_manager import manager
from src.models.laptop import Laptop
from src.models.sale import Sale
from src.models.user import User

class LaptopService:
    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Laptop]:
        return await laptop_repo.get_multi(db, skip=skip, limit=limit)

    async def get_by_id(self, db: AsyncSession, laptop_id: int) -> Laptop:
        laptop = await laptop_repo.get(db, id=laptop_id)
        if not laptop:
            raise NotFoundException("Laptop")
        return laptop

    async def get_by_owner(self, db: AsyncSession, owner_id: int) -> List[Laptop]:
        return await laptop_repo.get_by_owner(db, owner_id=owner_id)

    async def create_for_user(self, db: AsyncSession, laptop_in: LaptopCreate, owner: User) -> Laptop:
        brand = await brand_service.get_owned_by_id(db, laptop_in.brand_id, owner)
        return await laptop_repo.create_with_owner(db, obj_in=laptop_in, owner_id=owner.id, brand_name=brand.name)

    def _check_can_modify(self, laptop: Laptop, current_user: User) -> None:
        if not current_user.is_admin and laptop.owner_id != current_user.id:
            raise ForbiddenException("You can only modify your own listings")

    async def update(self, db: AsyncSession, laptop_id: int, laptop_in: LaptopUpdate, current_user: User) -> Laptop:
        laptop = await self.get_by_id(db, laptop_id)
        self._check_can_modify(laptop, current_user)
        return await laptop_repo.update(db, db_obj=laptop, obj_in=laptop_in)

    async def delete(self, db: AsyncSession, laptop_id: int, current_user: User) -> Laptop:
        laptop = await self.get_by_id(db, laptop_id)
        self._check_can_modify(laptop, current_user)
        await laptop_repo.remove(db, id=laptop.id)
        return laptop

    async def record_sale(self, db: AsyncSession, laptop_id: int, quantity: int, current_user: User) -> Laptop:
        laptop = await self.get_by_id(db, laptop_id)
        self._check_can_modify(laptop, current_user)
        if laptop.stock_quantity < quantity:
            raise BadRequestException("Not enough stock to record this sale")
        laptop.stock_quantity -= quantity
        db.add(Sale(
            laptop_id=laptop.id, owner_id=laptop.owner_id, brand_id=laptop.brand_id,
            quantity=quantity, unit_price_tjs=laptop.price_tjs, total_tjs=float(laptop.price_tjs) * quantity,
        ))
        await db.commit()
        await db.refresh(laptop)
        message = {"type": "sale_recorded", "message": f"Sale recorded: {quantity}x {laptop.brand} {laptop.model_name}"}
        await manager.broadcast_to_admins(message)
        if laptop.owner_id is not None:
            await manager.send_to_user(laptop.owner_id, message)
        return laptop

laptop_service = LaptopService()
