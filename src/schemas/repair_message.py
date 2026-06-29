from pydantic import BaseModel, ConfigDict
from datetime import datetime

class RepairMessageCreate(BaseModel):
    message_text: str

class RepairMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    repair_id: int
    sender_id: int
    sender_name: str
    message_text: str
    created_at: datetime
