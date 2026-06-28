from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from src.schemas.laptop import LaptopRead
from src.schemas.user import UserRead
from src.schemas.phone import PhoneRead

class OrderBase(BaseModel):
    quantity: int = Field(default=1, gt=0)
    payment_method: str = Field(..., min_length=2, max_length=50) # alif, humo, eskhata, dc
    installment_months: Optional[int] = Field(default=0, ge=0)

class OrderCreate(OrderBase):
    laptop_id: Optional[int] = None
    phone_id: Optional[int] = None

class OrderUpdate(BaseModel):
    status: str = Field(..., min_length=2, max_length=50) # pending, processing, completed, cancelled

class OrderRead(OrderBase):
    id: int
    user_id: int
    laptop_id: Optional[int] = None
    phone_id: Optional[int] = None
    total_price: float
    status: str
    created_at: datetime
    updated_at: datetime
    
    laptop: Optional[LaptopRead] = None
    phone: Optional[PhoneRead] = None
    user: Optional[UserRead] = None

    model_config = ConfigDict(from_attributes=True)
