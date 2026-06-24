from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, Numeric, Integer, DateTime, func
from datetime import datetime
from src.models.base import Base

class Laptop(Base):
    __tablename__ = "laptops"

    id: Mapped[int] = mapped_column(primary_key=True)
    brand: Mapped[str] = mapped_column(String(100), index=True)
    model_name: Mapped[str] = mapped_column(String(255), index=True)
    cpu: Mapped[str] = mapped_column(String(100))
    ram_gb: Mapped[int] = mapped_column(Integer)
    storage_gb: Mapped[int] = mapped_column(Integer)
    gpu: Mapped[str] = mapped_column(String(100), nullable=True)
    
    price_tjs: Mapped[float] = mapped_column(Numeric(12, 2))
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    
    keyboard_layout: Mapped[str] = mapped_column(String(50), default="English/Cyrillic")
    warranty_months: Mapped[int] = mapped_column(Integer, default=12)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
