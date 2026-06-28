import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Package } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { StatsOverview, MonthlySalesPoint, BrandPerformancePoint, getMyStatsOverview, getMyStatsMonthly, getMyStatsBrands } from '../api/stats';
import { StatCard } from '../components/charts/StatCard';
import { RevenueTrendChart } from '../components/charts/RevenueTrendChart';
import { BrandPerformanceChart } from '../components/charts/BrandPerformanceChart';
import '../components/charts/charts.css';
import './Admin.css';

export const MyStats: React.FC = () => {
  const { t } = useLang();
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [monthly, setMonthly] = useState<MonthlySalesPoint[]>([]);
  const [brandPerf, setBrandPerf] = useState<BrandPerformancePoint[]>([]);

  useEffect(() => {
    getMyStatsOverview().then(setOverview).catch(() => {});
    getMyStatsMonthly().then(setMonthly).catch(() => {});
    getMyStatsBrands().then(setBrandPerf).catch(() => {});
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">{t('myStatsTitle')}</h1>
      </div>
      <p className="admin-empty" style={{ marginBottom: '1.25rem' }}>{t('myStatsDesc')}</p>

      <div className="stats-grid">
        <StatCard index={0} icon={<TrendingUp size={20} />} label={t('totalRevenue')} value={`${(overview?.total_revenue ?? 0).toLocaleString()} TJS`} />
        <StatCard index={1} icon={<ShoppingBag size={20} />} label={t('totalSales')} value={`${overview?.total_sales ?? 0}`} />
        <StatCard index={2} icon={<Package size={20} />} label={t('totalListings')} value={`${overview?.total_listings ?? 0}`} />
      </div>
      <div className="charts-row">
        <RevenueTrendChart data={monthly} title={t('revenueTrend')} emptyLabel={t('noSalesDataYet')} />
        <BrandPerformanceChart data={brandPerf} title={t('brandPerformance')} emptyLabel={t('noSalesDataYet')} />
      </div>
    </div>
  );
};
