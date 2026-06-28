import apiClient from './client';

export interface StatsOverview {
  total_revenue: number;
  total_sales: number;
  total_listings: number;
  total_users?: number | null;
}

export interface MonthlySalesPoint {
  month: string;
  revenue: number;
  sales_count: number;
}

export interface BrandPerformancePoint {
  brand_id: number;
  brand_name: string;
  revenue: number;
  sales_count: number;
}

export const getMyStatsOverview = async (): Promise<StatsOverview> =>
  (await apiClient.get('/stats/me/overview')).data;
export const getMyStatsMonthly = async (): Promise<MonthlySalesPoint[]> =>
  (await apiClient.get('/stats/me/monthly')).data;
export const getMyStatsBrands = async (): Promise<BrandPerformancePoint[]> =>
  (await apiClient.get('/stats/me/brands')).data;

export const getAdminStatsOverview = async (): Promise<StatsOverview> =>
  (await apiClient.get('/stats/admin/overview')).data;
export const getAdminStatsMonthly = async (): Promise<MonthlySalesPoint[]> =>
  (await apiClient.get('/stats/admin/monthly')).data;
export const getAdminStatsBrands = async (): Promise<BrandPerformancePoint[]> =>
  (await apiClient.get('/stats/admin/brands')).data;
