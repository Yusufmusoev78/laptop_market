from pydantic import BaseModel, Field

class SaleCreate(BaseModel):
    quantity: int = Field(default=1, ge=1)
