from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, Numeric, Integer, DateTime, ForeignKey, func
from datetime import datetime
from src.models.base import Base

class Phone(Base):
    __tablename__ = "phones"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    brand_id: Mapped[Optional[int]] = mapped_column(ForeignKey("brands.id"), nullable=True, index=True)
    brand: Mapped[str] = mapped_column(String(100), index=True)
    model_name: Mapped[str] = mapped_column(String(255), index=True)
    
    cpu: Mapped[str] = mapped_column(String(100)) # e.g. A17 Pro, Snapdragon 8 Gen 3
    ram_gb: Mapped[int] = mapped_column(Integer)
    storage_gb: Mapped[int] = mapped_column(Integer)
    screen_size_inches: Mapped[float] = mapped_column(Numeric(4, 2)) # e.g. 6.70
    battery_capacity_mah: Mapped[int] = mapped_column(Integer) # e.g. 4440
    color: Mapped[str] = mapped_column(String(50)) # e.g. Titanium Black
    
    price_tjs: Mapped[float] = mapped_column(Numeric(12, 2))
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    
    warranty_months: Mapped[int] = mapped_column(Integer, default=12)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
