from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class LaptopBase(BaseModel):
    brand: str
    model_name: str
    cpu: str
    ram_gb: int
    storage_gb: int
    gpu: Optional[str] = None
    price_tjs: float = Field(..., gt=0)
    stock_quantity: int = Field(default=0, ge=0)
    keyboard_layout: str = "English/Cyrillic"
    warranty_months: int = 12
    description: Optional[str] = None

class LaptopCreate(LaptopBase):
    pass

class LaptopUpdate(BaseModel):
    brand: Optional[str] = None
    model_name: Optional[str] = None
    cpu: Optional[str] = None
    ram_gb: Optional[int] = None
    storage_gb: Optional[int] = None
    gpu: Optional[str] = None
    price_tjs: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    keyboard_layout: Optional[str] = None
    warranty_months: Optional[int] = None
    description: Optional[str] = None

class LaptopRead(LaptopBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
