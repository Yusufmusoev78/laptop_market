from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.order import order_repo
from src.repositories.laptop import laptop_repo
from src.repositories.phone import phone_repo
from src.schemas.order import OrderCreate, OrderUpdate
from src.models.order import Order
from src.models.sale import Sale
from src.models.user import User
from src.core.exceptions import NotFoundException, BadRequestException, ForbiddenException
from src.core.ws_manager import manager

class OrderService:
    def get_markup_multiplier(self, months: Optional[int]) -> float:
        if not months:
            return 1.0
        if months == 3: return 1.0
        if months == 6: return 1.05
        if months == 12: return 1.12
        if months == 24: return 1.22
        return 1.0

    async def get_by_user(self, db: AsyncSession, user_id: int) -> List[Order]:
        return await order_repo.get_by_user(db, user_id=user_id)

    async def get_all_admin(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Order]:
        return await order_repo.get_all_with_relations(db, skip=skip, limit=limit)

    async def create_order(self, db: AsyncSession, order_in: OrderCreate, buyer: User) -> Order:
        if order_in.laptop_id:
            laptop = await laptop_repo.get(db, id=order_in.laptop_id)
            if not laptop:
                raise NotFoundException("Laptop")
            
            if laptop.stock_quantity < order_in.quantity:
                raise BadRequestException("Not enough stock for this laptop")

            # Decrement stock
            laptop.stock_quantity -= order_in.quantity

            # Calculate price with installment markup
            multiplier = self.get_markup_multiplier(order_in.installment_months)
            total_price = float(laptop.price_tjs) * order_in.quantity * multiplier

            # Create Order
            db_order = Order(
                user_id=buyer.id,
                laptop_id=laptop.id,
                quantity=order_in.quantity,
                total_price=total_price,
                payment_method=order_in.payment_method,
                installment_months=order_in.installment_months,
                status="pending"
            )
            db.add(db_order)

            # Record Sale for the seller
            sale = Sale(
                laptop_id=laptop.id,
                owner_id=laptop.owner_id,
                brand_id=laptop.brand_id,
                quantity=order_in.quantity,
                unit_price_tjs=laptop.price_tjs,
                total_tjs=float(laptop.price_tjs) * order_in.quantity
            )
            db.add(sale)
            product_name = f"{laptop.brand} {laptop.model_name}"
            owner_id = laptop.owner_id

        elif order_in.phone_id:
            phone = await phone_repo.get(db, id=order_in.phone_id)
            if not phone:
                raise NotFoundException("Phone")
            
            if phone.stock_quantity < order_in.quantity:
                raise BadRequestException("Not enough stock for this phone")

            # Decrement stock
            phone.stock_quantity -= order_in.quantity

            # Calculate price with installment markup
            multiplier = self.get_markup_multiplier(order_in.installment_months)
            total_price = float(phone.price_tjs) * order_in.quantity * multiplier

            # Create Order
            db_order = Order(
                user_id=buyer.id,
                phone_id=phone.id,
                quantity=order_in.quantity,
                total_price=total_price,
                payment_method=order_in.payment_method,
                installment_months=order_in.installment_months,
                status="pending"
            )
            db.add(db_order)

            # Record Sale for the seller
            sale = Sale(
                phone_id=phone.id,
                owner_id=phone.owner_id,
                brand_id=phone.brand_id,
                quantity=order_in.quantity,
                unit_price_tjs=phone.price_tjs,
                total_tjs=float(phone.price_tjs) * order_in.quantity
            )
            db.add(sale)
            product_name = f"{phone.brand} {phone.model_name}"
            owner_id = phone.owner_id

        else:
            raise BadRequestException("Either laptop_id or phone_id must be provided")

        await db.commit()
        
        # Load relations for the return schema
        order_with_relations = await order_repo.get_with_relations(db, order_id=db_order.id)
        if not order_with_relations:
            await db.refresh(db_order)
            return db_order

        # Broadcast update
        notification = {
            "type": "order_created",
            "message": f"New order placed by {buyer.username or buyer.email}: {order_in.quantity}x {product_name}"
        }
        await manager.broadcast_to_admins(notification)
        if owner_id is not None:
            await manager.send_to_user(owner_id, notification)

        return order_with_relations

    async def update_status(self, db: AsyncSession, order_id: int, status_in: OrderUpdate) -> Order:
        order = await order_repo.get(db, id=order_id)
        if not order:
            raise NotFoundException("Order")
        
        order.status = status_in.status
        db.add(order)
        await db.commit()
        
        order_with_relations = await order_repo.get_with_relations(db, order_id=order.id)
        if not order_with_relations:
            await db.refresh(order)
            return order

        # Notify the buyer of status change
        notification = {
            "type": "order_status_updated",
            "message": f"Your order #{order.id} status has been updated to {status_in.status}"
        }
        await manager.send_to_user(order.user_id, notification)

        return order_with_relations

order_service = OrderService()
