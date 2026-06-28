from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.phone import phone_repo
from src.schemas.phone import PhoneCreate, PhoneUpdate
from src.services.brand import brand_service
from src.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from src.core.ws_manager import manager
from src.models.phone import Phone
from src.models.sale import Sale
from src.models.user import User

class PhoneService:
    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Phone]:
        return await phone_repo.get_multi(db, skip=skip, limit=limit)

    async def get_by_id(self, db: AsyncSession, phone_id: int) -> Phone:
        phone = await phone_repo.get(db, id=phone_id)
        if not phone:
            raise NotFoundException("Phone")
        return phone

    async def get_by_owner(self, db: AsyncSession, owner_id: int) -> List[Phone]:
        return await phone_repo.get_by_owner(db, owner_id=owner_id)

    async def create_for_user(self, db: AsyncSession, phone_in: PhoneCreate, owner: User) -> Phone:
        brand = await brand_service.get_owned_by_id(db, phone_in.brand_id, owner)
        return await phone_repo.create_with_owner(db, obj_in=phone_in, owner_id=owner.id, brand_name=brand.name)

    def _check_can_modify(self, phone: Phone, current_user: User) -> None:
        if not current_user.is_admin and phone.owner_id != current_user.id:
            raise ForbiddenException("You can only modify your own listings")

    async def update(self, db: AsyncSession, phone_id: int, phone_in: PhoneUpdate, current_user: User) -> Phone:
        phone = await self.get_by_id(db, phone_id)
        self._check_can_modify(phone, current_user)
        return await phone_repo.update(db, db_obj=phone, obj_in=phone_in)

    async def delete(self, db: AsyncSession, phone_id: int, current_user: User) -> Phone:
        phone = await self.get_by_id(db, phone_id)
        self._check_can_modify(phone, current_user)
        await phone_repo.remove(db, id=phone.id)
        return phone

    async def record_sale(self, db: AsyncSession, phone_id: int, quantity: int, current_user: User) -> Phone:
        phone = await self.get_by_id(db, phone_id)
        self._check_can_modify(phone, current_user)
        if phone.stock_quantity < quantity:
            raise BadRequestException("Not enough stock to record this sale")
        phone.stock_quantity -= quantity
        db.add(Sale(
            phone_id=phone.id, owner_id=phone.owner_id, brand_id=phone.brand_id,
            quantity=quantity, unit_price_tjs=phone.price_tjs, total_tjs=float(phone.price_tjs) * quantity,
        ))
        await db.commit()
        await db.refresh(phone)
        message = {"type": "sale_recorded", "message": f"Sale recorded: {quantity}x {phone.brand} {phone.model_name}"}
        await manager.broadcast_to_admins(message)
        if phone.owner_id is not None:
            await manager.send_to_user(phone.owner_id, message)
        return phone

phone_service = PhoneService()
