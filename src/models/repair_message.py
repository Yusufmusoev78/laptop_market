from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from datetime import datetime
from src.models.base import Base

class RepairMessage(Base):
    __tablename__ = "repair_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    repair_id: Mapped[int] = mapped_column(ForeignKey("repairs.id"), index=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    sender_name: Mapped[str] = mapped_column(String(100))
    message_text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
