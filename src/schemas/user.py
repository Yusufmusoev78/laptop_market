from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True
    is_admin: bool = False

class UserCreate(UserBase):
    username: str = Field(..., min_length=3, max_length=50)
    phone: str = Field(..., min_length=5, max_length=30)
    address: str = Field(..., min_length=3, max_length=255)
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

class UserRead(UserBase):
    id: int
    username: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UsernameAvailability(BaseModel):
    available: bool
    suggestions: List[str] = []

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
