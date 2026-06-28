from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, Numeric, DateTime, ForeignKey, func
from datetime import datetime
from src.models.base import Base

class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(primary_key=True)
    laptop_id: Mapped[int] = mapped_column(ForeignKey("laptops.id"), index=True)
    owner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    brand_id: Mapped[Optional[int]] = mapped_column(ForeignKey("brands.id"), nullable=True, index=True)
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price_tjs: Mapped[float] = mapped_column(Numeric(12, 2))
    total_tjs: Mapped[float] = mapped_column(Numeric(12, 2))
    sold_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
