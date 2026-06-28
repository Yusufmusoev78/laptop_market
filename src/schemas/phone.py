from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class PhoneBase(BaseModel):
    model_name: str
    cpu: str
    ram_gb: int
    storage_gb: int
    screen_size_inches: float = Field(..., gt=0)
    battery_capacity_mah: int = Field(..., gt=0)
    color: str
    price_tjs: float = Field(..., gt=0)
    stock_quantity: int = Field(default=0, ge=0)
    warranty_months: int = 12
    description: Optional[str] = None

class PhoneCreate(PhoneBase):
    brand_id: int

class PhoneUpdate(BaseModel):
    brand: Optional[str] = None
    model_name: Optional[str] = None
    cpu: Optional[str] = None
    ram_gb: Optional[int] = None
    storage_gb: Optional[int] = None
    screen_size_inches: Optional[float] = Field(None, gt=0)
    battery_capacity_mah: Optional[int] = Field(None, ge=0)
    color: Optional[str] = None
    price_tjs: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    warranty_months: Optional[int] = None
    description: Optional[str] = None

class PhoneRead(PhoneBase):
    id: int
    owner_id: Optional[int] = None
    brand: str
    brand_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
