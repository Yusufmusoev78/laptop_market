from typing import List, Optional
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.sale import Sale
from src.models.laptop import Laptop
from src.models.user import User
from src.models.brand import Brand
from src.schemas.stats import StatsOverview, MonthlySalesPoint, BrandPerformancePoint

LAST_12_MONTHS = text("now() - interval '12 months'")

class StatsService:
    async def get_overview(self, db: AsyncSession, owner_id: Optional[int] = None) -> StatsOverview:
        sales_query = select(func.coalesce(func.sum(Sale.total_tjs), 0), func.count(Sale.id))
        listings_query = select(func.count(Laptop.id))
        if owner_id is not None:
            sales_query = sales_query.where(Sale.owner_id == owner_id)
            listings_query = listings_query.where(Laptop.owner_id == owner_id)

        revenue, sales_count = (await db.execute(sales_query)).one()
        listings_count = (await db.execute(listings_query)).scalar_one()

        total_users = None
        if owner_id is None:
            total_users = (await db.execute(select(func.count(User.id)))).scalar_one()

        return StatsOverview(
            total_revenue=float(revenue), total_sales=sales_count,
            total_listings=listings_count, total_users=total_users,
        )

    async def get_monthly(self, db: AsyncSession, owner_id: Optional[int] = None) -> List[MonthlySalesPoint]:
        month_col = func.to_char(Sale.sold_at, 'YYYY-MM')
        query = (
            select(month_col.label('month'), func.sum(Sale.total_tjs), func.count(Sale.id))
            .where(Sale.sold_at >= LAST_12_MONTHS)
            .group_by(month_col)
            .order_by(month_col)
        )
        if owner_id is not None:
            query = query.where(Sale.owner_id == owner_id)
        rows = (await db.execute(query)).all()
        return [MonthlySalesPoint(month=r[0], revenue=float(r[1]), sales_count=r[2]) for r in rows]

    async def get_brand_performance(self, db: AsyncSession, owner_id: Optional[int] = None) -> List[BrandPerformancePoint]:
        query = (
            select(Brand.id, Brand.name, func.sum(Sale.total_tjs), func.count(Sale.id))
            .join(Sale, Sale.brand_id == Brand.id)
            .group_by(Brand.id, Brand.name)
            .order_by(func.sum(Sale.total_tjs).desc())
        )
        if owner_id is not None:
            query = query.where(Sale.owner_id == owner_id)
        rows = (await db.execute(query)).all()
        return [BrandPerformancePoint(brand_id=r[0], brand_name=r[1], revenue=float(r[2]), sales_count=r[3]) for r in rows]

stats_service = StatsService()
