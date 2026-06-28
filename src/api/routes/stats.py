from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List
from src.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from src.schemas.stats import StatsOverview, MonthlySalesPoint, BrandPerformancePoint
from src.services.stats import stats_service
from src.models.user import User

router = APIRouter()

@router.get("/me/overview", response_model=StatsOverview)
async def my_stats_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Stats overview for the current user's own listings/sales only."""
    return await stats_service.get_overview(db, owner_id=current_user.id)

@router.get("/me/monthly", response_model=List[MonthlySalesPoint])
async def my_stats_monthly(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Monthly sales trend for the current user's own sales only."""
    return await stats_service.get_monthly(db, owner_id=current_user.id)

@router.get("/me/brands", response_model=List[BrandPerformancePoint])
async def my_stats_brands(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Brand performance for the current user's own brands only."""
    return await stats_service.get_brand_performance(db, owner_id=current_user.id)

@router.get("/admin/overview", response_model=StatsOverview)
async def admin_stats_overview(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user)
) -> Any:
    """Global stats overview (admin only)."""
    return await stats_service.get_overview(db)

@router.get("/admin/monthly", response_model=List[MonthlySalesPoint])
async def admin_stats_monthly(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user)
) -> Any:
    """Global monthly sales trend (admin only)."""
    return await stats_service.get_monthly(db)

@router.get("/admin/brands", response_model=List[BrandPerformancePoint])
async def admin_stats_brands(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user)
) -> Any:
    """Global brand performance (admin only)."""
    return await stats_service.get_brand_performance(db)
