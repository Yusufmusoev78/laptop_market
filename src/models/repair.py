from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, Numeric, Integer, DateTime, func, ForeignKey
from datetime import datetime
from src.models.base import Base

class RepairRequest(Base):
    __tablename__ = "repairs"

    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    usto_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(50))
    device_type: Mapped[str] = mapped_column(String(50)) # laptop, phone, pc
    service_type: Mapped[str] = mapped_column(String(50)) # repair, upgrade
    description: Mapped[str] = mapped_column(Text)
    estimated_cost: Mapped[float] = mapped_column(Numeric(12, 2))
    status: Mapped[str] = mapped_column(String(50), default="pending") # pending, in_progress, completed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
