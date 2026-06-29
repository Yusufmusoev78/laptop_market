from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class RepairCreate(BaseModel):
    name: str
    phone: str
    device_type: str
    service_type: str
    description: str
    estimated_cost: float
    client_id: Optional[int] = None
    usto_id: Optional[int] = None

class RepairRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: Optional[int] = None
    usto_id: Optional[int] = None
    name: str
    phone: str
    device_type: str
    service_type: str
    description: str
    estimated_cost: float
    status: str
    created_at: datetime
