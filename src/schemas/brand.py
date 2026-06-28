from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional
from datetime import datetime

class BrandBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    contact_phone: str = Field(..., min_length=5, max_length=30)
    support_email: EmailStr
    description: Optional[str] = None

class BrandCreate(BrandBase):
    pass

class BrandRead(BrandBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
