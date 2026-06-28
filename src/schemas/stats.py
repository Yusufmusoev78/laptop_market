from pydantic import BaseModel
from typing import Optional

class StatsOverview(BaseModel):
    total_revenue: float
    total_sales: int
    total_listings: int
    total_users: Optional[int] = None

class MonthlySalesPoint(BaseModel):
    month: str
    revenue: float
    sales_count: int

class BrandPerformancePoint(BaseModel):
    brand_id: int
    brand_name: str
    revenue: float
    sales_count: int
