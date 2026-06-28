from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, Integer, DateTime, ForeignKey, func
from datetime import datetime
from src.models.base import Base

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    laptop_id: Mapped[int] = mapped_column(ForeignKey("laptops.id"), index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    total_price: Mapped[float] = mapped_column(Numeric(12, 2))
    payment_method: Mapped[str] = mapped_column(String(50))  # e.g., "alif", "humo", "eskhata", "dc"
    installment_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=0)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, processing, completed, cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    laptop: Mapped["Laptop"] = relationship(foreign_keys=[laptop_id])
    user: Mapped["User"] = relationship(foreign_keys=[user_id])
