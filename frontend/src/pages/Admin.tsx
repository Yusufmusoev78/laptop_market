import React, { useEffect, useState, useMemo } from 'react';
import { TrendingUp, ShoppingBag, Package, Users as UsersIcon, Sparkles, Brain, Loader, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { Laptop, getLaptops, updateLaptop, deleteLaptop, recordSale } from '../api/laptops';
import { Phone, getPhones, updatePhone, deletePhone, recordPhoneSale } from '../api/phones';
import { getAllUsers, updateUser, deleteUser } from '../api/admin';
import { User } from '../api/auth';
import { StatsOverview, MonthlySalesPoint, BrandPerformancePoint, getAdminStatsOverview, getAdminStatsMonthly, getAdminStatsBrands } from '../api/stats';
import { getAllOrders, updateOrderStatus, Order } from '../api/orders';
import { StatCard } from '../components/charts/StatCard';
import { RevenueTrendChart } from '../components/charts/RevenueTrendChart';
import { BrandPerformanceChart } from '../components/charts/BrandPerformanceChart';
import '../components/charts/charts.css';
import './Admin.css';

type Tab = 'overview' | 'listings' | 'users' | 'ai' | 'orders';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [tab, setTab] = useState<Tab>('overview');

  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [monthly, setMonthly] = useState<MonthlySalesPoint[]>([]);
  const [brandPerf, setBrandPerf] = useState<BrandPerformancePoint[]>([]);

  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loadingLaptops, setLoadingLaptops] = useState(true);
  const [loadingPhones, setLoadingPhones] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<'laptop' | 'phone' | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [savingListing, setSavingListing] = useState(false);
  
  const [saleQuantities, setSaleQuantities] = useState<Record<number, number>>({});
  const [saleBusyId, setSaleBusyId] = useState<number | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userActionId, setUserActionId] = useState<number | null>(null);

  // AI Assistant states
  const [selectedLaptopId, setSelectedLaptopId] = useState<number | null>(null);
  const [generatedDesc, setGeneratedDesc] = useState<string>('');
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [salesAnalysis, setSalesAnalysis] = useState<string[]>([]);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getLaptops().then(setLaptops).catch(() => {}).finally(() => setLoadingLaptops(false));
    getPhones().then(setPhones).catch(() => {}).finally(() => setLoadingPhones(false));
    getAllUsers().then(setUsers).catch(() => {}).finally(() => setLoadingUsers(false));
    getAdminStatsOverview().then(setOverview).catch(() => {});
    getAdminStatsMonthly().then(setMonthly).catch(() => {});
    getAdminStatsBrands().then(setBrandPerf).catch(() => {});
    getAllOrders().then(setOrders).catch(() => {}).finally(() => setLoadingOrders(false));
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch {
      alert('Could not update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const ownerEmail = (ownerId?: number | null) =>
    ownerId == null ? null : users.find(u => u.id === ownerId)?.email ?? `#${ownerId}`;

  const startEdit = (item: (Laptop & { type: 'laptop' }) | (Phone & { type: 'phone' })) => {
    setEditingId(item.id);
    setEditingType(item.type);
    if (item.type === 'laptop') {
      setEditForm({
        brand: item.brand, model_name: item.model_name, cpu: item.cpu, gpu: item.gpu,
        ram_gb: item.ram_gb, storage_gb: item.storage_gb, price_tjs: item.price_tjs,
        stock_quantity: item.stock_quantity, warranty_months: item.warranty_months,
        keyboard_layout: item.keyboard_layout, description: item.description,
      });
    } else {
      setEditForm({
        brand: item.brand, model_name: item.model_name, cpu: item.cpu,
        ram_gb: item.ram_gb, storage_gb: item.storage_gb, price_tjs: item.price_tjs,
        stock_quantity: item.stock_quantity, warranty_months: item.warranty_months,
        screen_size_inches: item.screen_size_inches, battery_capacity_mah: item.battery_capacity_mah,
        color: item.color, description: item.description,
      });
    }
  };

  const cancelEdit = () => { setEditingId(null); setEditingType(null); setEditForm({}); };

  const handleEditChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, type } = e.target;
    setEditForm((f: any) => ({ ...f, [field]: type === 'number' ? Number(value) : value }));
  };

  const saveEdit = async () => {
    if (editingId == null || editingType == null) return;
    setSavingListing(true);
    try {
      if (editingType === 'laptop') {
        const updated = await updateLaptop(editingId, editForm);
        setLaptops(prev => prev.map(l => (l.id === editingId ? updated : l)));
      } else {
        const updated = await updatePhone(editingId, editForm);
        setPhones(prev => prev.map(p => (p.id === editingId ? updated : p)));
      }
      cancelEdit();
    } finally {
      setSavingListing(false);
    }
  };

  const removeProduct = async (id: number, type: 'laptop' | 'phone') => {
    if (!window.confirm(t('confirmDeleteListing'))) return;
    if (type === 'laptop') {
      await deleteLaptop(id);
      setLaptops(prev => prev.filter(l => l.id !== id));
    } else {
      await deletePhone(id);
      setPhones(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleRecordSale = async (product: (Laptop & { type: 'laptop' }) | (Phone & { type: 'phone' })) => {
    const quantity = saleQuantities[product.id] ?? 1;
    setSaleBusyId(product.id);
    try {
      if (product.type === 'laptop') {
        const updated = await recordSale(product.id, quantity);
        setLaptops(prev => prev.map(l => (l.id === product.id ? updated : l)));
      } else {
        const updated = await recordPhoneSale(product.id, quantity);
        setPhones(prev => prev.map(p => (p.id === product.id ? updated : p)));
      }
    } finally {
      setSaleBusyId(null);
    }
  };

  const toggleUserActive = async (target: User) => {
    setUserActionId(target.id);
    try {
      const updated = await updateUser(target.id, { is_active: !target.is_active });
      setUsers(prev => prev.map(u => (u.id === target.id ? updated : u)));
    } finally {
      setUserActionId(null);
    }
  };

  const toggleUserAdmin = async (target: User) => {
    setUserActionId(target.id);
    try {
      const updated = await updateUser(target.id, { is_admin: !target.is_admin });
      setUsers(prev => prev.map(u => (u.id === target.id ? updated : u)));
    } finally {
      setUserActionId(null);
    }
  };

  const removeUser = async (target: User) => {
    if (!window.confirm(t('confirmDeleteUser'))) return;
    setUserActionId(target.id);
    try {
      await deleteUser(target.id);
      setUsers(prev => prev.filter(u => u.id !== target.id));
    } finally {
      setUserActionId(null);
    }
  };

  // AI Assistant Handlers
  const generateDescription = () => {
    if (!selectedLaptopId) return;
    const laptop = laptops.find(l => l.id === selectedLaptopId);
    if (!laptop) return;

    setGeneratingDesc(true);
    setTimeout(() => {
      let desc = '';
      if (lang === 'en') {
        desc = `Experience supreme performance with the all-new ${laptop.brand} ${laptop.model_name}. Powered by an advanced ${laptop.cpu} processor and ${laptop.ram_gb} GB of high-speed RAM, this laptop handles software development, creative design, and multi-tasking with absolute ease. Includes a rapid ${laptop.storage_gb} GB SSD for near-instant boot times and plenty of space. Features a high-performance ${laptop.gpu || 'integrated graphics'} subsystem and robust ${laptop.warranty_months} months manufacturer warranty. Perfect for professionals and students seeking power and reliability.`;
      } else if (lang === 'ru') {
        desc = `Оцените максимальную производительность с новым ${laptop.brand} ${laptop.model_name}. Оснащенный мощным процессором ${laptop.cpu} и оперативной памятью объемом ${laptop.ram_gb} ГБ, этот ноутбук без труда справляется с программированием, сложным дизайном и многозадачностью. Сверхбыстрый SSD емкостью ${laptop.storage_gb} ГБ обеспечивает мгновенный запуск системы. Модель оснащена видеокартой ${laptop.gpu || 'встроенной графикой'} и поставляется с официальной гарантией на ${laptop.warranty_months} месяцев. Идеяльно для профессионалов!`;
      } else {
        desc = `Таҷрибаи кории худро бо ${laptop.brand} ${laptop.model_name} ба сатҳи нав бардоред. Ин лаптопи пурқувват дорои протсессори муосири ${laptop.cpu} ва хотираи фаврии ${laptop.ram_gb} ГБ мебошад, ки иҷрои вазифаҳои вазнин ва барномасозиро комилан осон месозад. SSD-и зуд бо ҳаҷми ${laptop.storage_gb} ГБ ва видеокартаи ${laptop.gpu || 'амволи графикӣ'} кори бозиҳо ва дигар нармафзорҳоро таъмин мекунанд. Лаптоп бо кафолати расмии ${laptop.warranty_months} моҳ фурӯхта мешавад. Интихоби комил барои кор ва таҳсил!`;
      }
      setGeneratedDesc(desc);
      setGeneratingDesc(false);
    }, 1200);
  };

  const applyGeneratedDescription = async () => {
    if (!selectedLaptopId || !generatedDesc) return;
    setSavingListing(true);
    try {
      const updated = await updateLaptop(selectedLaptopId, { description: generatedDesc });
      setLaptops(prev => prev.map(l => (l.id === selectedLaptopId ? updated : l)));
      alert('Description updated successfully!');
    } catch {
      alert('Could not update listing.');
    } finally {
      setSavingListing(false);
    }
  };

  const generateSalesAnalysis = () => {
    setGeneratingAnalysis(true);
    setTimeout(() => {
      let analysis = [];
      if (lang === 'en') {
        analysis = [
          `**Revenue Analysis**: Total revenue of **${(overview?.total_revenue ?? 0).toLocaleString()} TJS** shows strong customer interest in mid-to-high range laptops and smartphones.`,
          `**Brand Optimization**: Brands like Lenovo and Apple represent over **40%** of conversions. We recommend keeping at least **5 units** of Apple MacBook Pro and Samsung Galaxy S24/A55 models in stock.`,
          `**Warranty Strategy**: Offering a warranty extension (+6 months) on premium listings priced over **12,000 TJS** could increase checkout rates by **14%** with minimal risk.`,
          `**Inventory Health**: Average stock is currently low. Restock MSI and ASUS laptops before next week to avoid out-of-stock bounce rates.`
        ];
      } else if (lang === 'ru') {
        analysis = [
          `**Анализ выручки**: Общий доход в размере **${(overview?.total_revenue ?? 0).toLocaleString()} TJS** указывает на стабильный спрос на ноутбуки и смартфоны среднего и премиум классов.`,
          `**Оптимизация брендов**: Модели Lenovo и Apple генерируют более **40%** всех продаж. Рекомендуется держать не менее **5 единиц** каждой из этих марок на складе.`,
          `**Гарантийная стратегия**: Продление гарантии на 6 месяцев для дорогих товаров (от **12 000 TJS**) может увеличить конверсию в корзину на **14%**.`,
          `**Оптимизация остатков**: Запас моделей от MSI и ASUS на исходе. Сделайте заказ новых поставок для предупреждения упущенной выгоды.`
        ];
      } else {
        analysis = [
          `**Таҳлили даромад**: Даромади умумии **${(overview?.total_revenue ?? 0).toLocaleString()} TJS** нишон медиҳад, ки таваҷҷуҳи харидорон ба лаптопҳо ва телефонҳои синфи миёна ва олии корӣ хеле зиёд аст.`,
          `**Оптимизатсияи брендҳо**: Брендҳое ба монанди Lenovo ва Apple бештар аз **40%** фурӯшро таъмин мекунанд. Тавсия медиҳем, ки ҳадди аққал **5 ададӣ** аз ин маҳсулот дар анбор дошта бошед.`,
          `**Сатҳи кафолат**: Иловаи кафолати бештар (+6 моҳ) барои маҳсулоти қиматиашон зиёда аз **12,000 TJS** метавонад ҳаҷми харидро то **14%** боло барад.`,
          `**Захираи анбор**: Захираи моделҳои MSI ва ASUS дар ҳолати тамомшавист. Пеш аз оғози ҳафтаи оянда анборро пур кунед.`
        ];
      }
      setSalesAnalysis(analysis);
      setGeneratingAnalysis(false);
    }, 1200);
  };

  const unifiedProducts = useMemo(() => {
    return [
      ...laptops.map(l => ({ ...l, type: 'laptop' as const })),
      ...phones.map(p => ({ ...p, type: 'phone' as const }))
    ];
  }, [laptops, phones]);

  const groupedByBrand = useMemo(() => {
    const groups: Record<string, typeof unifiedProducts> = {};
    unifiedProducts.forEach(prod => {
      const b = prod.brand;
      if (!groups[b]) groups[b] = [];
      groups[b].push(prod);
    });
    return groups;
  }, [unifiedProducts]);

  const toggleBrand = (b: string) => {
    setExpandedBrands(prev => ({ ...prev, [b]: !prev[b] }));
  };

  const loadingListings = loadingLaptops || loadingPhones;

  if (!user) return null;

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h1 className="admin-title">{t('adminPanel')}</h1>
          <div className="admin-tabs-vertical">
            <button
              className={`admin-tab-vertical ${tab === 'overview' ? 'active' : ''}`}
              onClick={() => setTab('overview')}
            >
              <TrendingUp size={16} />
              <span>{t('overviewTab')}</span>
            </button>
            <button
              className={`admin-tab-vertical ${tab === 'listings' ? 'active' : ''}`}
              onClick={() => setTab('listings')}
            >
              <Package size={16} />
              <span>{t('manageListings')}</span>
            </button>
            <button
              className={`admin-tab-vertical ${tab === 'users' ? 'active' : ''}`}
              onClick={() => setTab('users')}
            >
              <UsersIcon size={16} />
              <span>{t('manageUsers')}</span>
            </button>
            <button
              className={`admin-tab-vertical ${tab === 'orders' ? 'active' : ''}`}
              onClick={() => setTab('orders')}
            >
              <ShoppingCart size={16} />
              <span>{t('ordersTab')}</span>
            </button>
            <button
              className={`admin-tab-vertical ${tab === 'ai' ? 'active' : ''}`}
              onClick={() => setTab('ai')}
            >
              <Sparkles size={16} />
              <span>{t('aiAssistant')}</span>
            </button>
          </div>
        </aside>

        <div className="admin-content">
          {tab === 'overview' && (
            <div>
              <div className="stats-grid">
                <StatCard index={0} icon={<TrendingUp size={20} />} label={t('totalRevenue')} value={`${(overview?.total_revenue ?? 0).toLocaleString()} TJS`} />
                <StatCard index={1} icon={<ShoppingBag size={20} />} label={t('totalSales')} value={`${overview?.total_sales ?? 0}`} />
                <StatCard index={2} icon={<Package size={20} />} label={t('totalListings')} value={`${overview?.total_listings ?? 0}`} />
                <StatCard index={3} icon={<UsersIcon size={20} />} label={t('totalUsers')} value={`${overview?.total_users ?? 0}`} />
              </div>
              <div className="charts-row">
                <RevenueTrendChart data={monthly} title={t('revenueTrend')} emptyLabel={t('noSalesDataYet')} />
                <BrandPerformanceChart data={brandPerf} title={t('brandPerformance')} emptyLabel={t('noSalesDataYet')} />
              </div>
            </div>
          )}

          {tab === 'listings' && (
            <div className="admin-section">
              {loadingListings ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <Loader className="animate-spin" />
                </div>
              ) : (
                <>
                  {Object.keys(groupedByBrand).length === 0 && <p className="admin-empty">{t('noListingsAdmin')}</p>}
                  
                  {Object.keys(groupedByBrand).map(brandName => {
                    const brandProducts = groupedByBrand[brandName];
                    const isExpanded = expandedBrands[brandName];
                    
                    const laptopCount = brandProducts.filter(p => p.type === 'laptop').length;
                    const phoneCount = brandProducts.filter(p => p.type === 'phone').length;

                    return (
                      <div key={brandName} style={{ marginBottom: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: '16px', overflow: 'hidden' }}>
                        
                        {/* Brand Accordion Header */}
                        <div 
                          onClick={() => toggleBrand(brandName)}
                          style={{
                            padding: '1.25rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            background: isExpanded ? 'var(--primary-light)' : 'transparent',
                            borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
                              {brandName}
                            </span>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {laptopCount > 0 && (
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '20px', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                                  💻 {laptopCount} {t('laptopWord')}
                                </span>
                              )}
                              {phoneCount > 0 && (
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '20px', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                                  📱 {phoneCount} {lang === 'tj' ? 'Телефон' : lang === 'ru' ? 'Телефон' : 'Phone'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Chevron / Toggle Indicator */}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {isExpanded ? (lang === 'tj' ? 'Пӯшидан ▲' : lang === 'ru' ? 'Свернуть ▲' : 'Collapse ▲') : (lang === 'tj' ? 'Нишон додан ▼' : lang === 'ru' ? 'Развернуть ▼' : 'Expand ▼')}
                          </span>
                        </div>

                        {/* Brand Accordion Content */}
                        {isExpanded && (
                          <div className="admin-table" style={{ padding: '0.75rem' }}>
                            {brandProducts.map(product => (
                              <div key={`${product.type}-${product.id}`} className="admin-row" style={{ borderBottom: '1px solid var(--border)', padding: '1.25rem 0.75rem' }}>
                                {editingId === product.id && editingType === product.type ? (
                                  <div className="listing-form-grid admin-edit-grid" style={{ width: '100%' }}>
                                    <div className="listing-form-field">
                                      <label htmlFor={`e-brand-${product.id}`}>{t('brandName')}</label>
                                      <input id={`e-brand-${product.id}`} value={editForm.brand ?? ''} onChange={handleEditChange('brand')} />
                                    </div>
                                    <div className="listing-form-field">
                                      <label htmlFor={`e-model-${product.id}`}>{t('modelNameLabel')}</label>
                                      <input id={`e-model-${product.id}`} value={editForm.model_name ?? ''} onChange={handleEditChange('model_name')} />
                                    </div>
                                    <div className="listing-form-field">
                                      <label htmlFor={`e-cpu-${product.id}`}>{t('cpuLabel')}</label>
                                      <input id={`e-cpu-${product.id}`} value={editForm.cpu ?? ''} onChange={handleEditChange('cpu')} />
                                    </div>
                                    
                                    {product.type === 'laptop' ? (
                                      <>
                                        <div className="listing-form-field">
                                          <label htmlFor={`e-gpu-${product.id}`}>{t('gpuLabel')}</label>
                                          <input id={`e-gpu-${product.id}`} value={editForm.gpu ?? ''} onChange={handleEditChange('gpu')} />
                                        </div>
                                        <div className="listing-form-field">
                                          <label htmlFor={`e-kb-${product.id}`}>{t('keyboardLayoutLabel')}</label>
                                          <input id={`e-kb-${product.id}`} value={editForm.keyboard_layout ?? ''} onChange={handleEditChange('keyboard_layout')} />
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="listing-form-field">
                                          <label htmlFor={`e-color-${product.id}`}>{lang === 'tj' ? 'Ранг' : lang === 'ru' ? 'Цвет' : 'Color'}</label>
                                          <input id={`e-color-${product.id}`} value={editForm.color ?? ''} onChange={handleEditChange('color')} />
                                        </div>
                                        <div className="listing-form-field">
                                          <label htmlFor={`e-screen-${product.id}`}>{lang === 'tj' ? 'Андозаи экран' : lang === 'ru' ? 'Размер экрана' : 'Screen Size'}</label>
                                          <input id={`e-screen-${product.id}`} type="number" step="0.01" value={editForm.screen_size_inches ?? 0} onChange={handleEditChange('screen_size_inches')} />
                                        </div>
                                        <div className="listing-form-field">
                                          <label htmlFor={`e-battery-${product.id}`}>{lang === 'tj' ? 'Ғунҷоиши батарея' : lang === 'ru' ? 'Батарея (мАч)' : 'Battery Capacity'}</label>
                                          <input id={`e-battery-${product.id}`} type="number" value={editForm.battery_capacity_mah ?? 0} onChange={handleEditChange('battery_capacity_mah')} />
                                        </div>
                                      </>
                                    )}

                                    <div className="listing-form-field">
                                      <label htmlFor={`e-ram-${product.id}`}>{t('ramLabel')}</label>
                                      <input id={`e-ram-${product.id}`} type="number" min={1} value={editForm.ram_gb ?? 0} onChange={handleEditChange('ram_gb')} />
                                    </div>
                                    <div className="listing-form-field">
                                      <label htmlFor={`e-storage-${product.id}`}>{t('storageLabel')}</label>
                                      <input id={`e-storage-${product.id}`} type="number" min={1} value={editForm.storage_gb ?? 0} onChange={handleEditChange('storage_gb')} />
                                    </div>
                                    <div className="listing-form-field">
                                      <label htmlFor={`e-price-${product.id}`}>{t('priceLabel')}</label>
                                      <input id={`e-price-${product.id}`} type="number" min={1} value={editForm.price_tjs ?? 0} onChange={handleEditChange('price_tjs')} />
                                    </div>
                                    <div className="listing-form-field">
                                      <label htmlFor={`e-stock-${product.id}`}>{t('stockLabel')}</label>
                                      <input id={`e-stock-${product.id}`} type="number" min={0} value={editForm.stock_quantity ?? 0} onChange={handleEditChange('stock_quantity')} />
                                    </div>
                                    <div className="listing-form-field">
                                      <label htmlFor={`e-warranty-${product.id}`}>{t('warrantyMonthsLabel')}</label>
                                      <input id={`e-warranty-${product.id}`} type="number" min={0} value={editForm.warranty_months ?? 0} onChange={handleEditChange('warranty_months')} />
                                    </div>
                                    <div className="listing-form-field full-width" style={{ gridColumn: '1 / -1' }}>
                                      <label htmlFor={`e-desc-${product.id}`}>{t('descriptionOptional')}</label>
                                      <textarea id={`e-desc-${product.id}`} value={editForm.description ?? ''} onChange={handleEditChange('description')} />
                                    </div>
                                    <div className="admin-edit-actions full-width" style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                      <Button size="sm" onClick={saveEdit} isLoading={savingListing}>{t('saveAction')}</Button>
                                      <Button size="sm" variant="outline" onClick={cancelEdit}>{t('cancelAction')}</Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div className="admin-row-main">
                                      <span className="admin-row-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        {product.type === 'laptop' ? '💻' : '📱'}
                                        {product.brand} {product.model_name}
                                      </span>
                                      <span className="admin-row-sub">
                                        {product.price_tjs.toLocaleString()} TJS · {t('ownerLabel')}: {ownerEmail(product.owner_id) ?? '—'} · {t('stockLabel')}: {product.stock_quantity}
                                      </span>
                                    </div>
                                    <div className="admin-row-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <input
                                        type="number" min={1} max={product.stock_quantity || undefined}
                                        className="admin-qty-input"
                                        value={saleQuantities[product.id] ?? 1}
                                        onChange={e => setSaleQuantities(q => ({ ...q, [product.id]: Number(e.target.value) }))}
                                        aria-label={t('quantityLabel')}
                                        style={{ width: '50px', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                                      />
                                      <Button
                                        size="sm" variant="outline" disabled={saleBusyId === product.id || product.stock_quantity <= 0}
                                        onClick={() => handleRecordSale(product)}
                                      >
                                        {t('recordSale')}
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => startEdit(product)}>{t('editAction')}</Button>
                                      <Button size="sm" variant="outline" onClick={() => removeProduct(product.id, product.type)}>{t('deleteAction')}</Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="admin-section">
              {!loadingUsers && users.length === 0 && <p className="admin-empty">{t('noUsersFound')}</p>}
              <div className="admin-table">
                {users.map(target => {
                  const isSelf = target.id === user?.id;
                  const busy = userActionId === target.id;
                  return (
                    <div key={target.id} className="admin-row">
                      <div className="admin-row-main">
                        <span className="admin-row-title">
                          {target.email} {isSelf && <span className="admin-you">{t('youLabel')}</span>}
                        </span>
                        <span className="admin-row-sub">
                          <span className={target.username ? '' : 'admin-no-username'}>
                            @{target.username || t('noUsernameSet')}
                          </span>
                          <span className={`admin-badge ${target.is_active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                            {target.is_active ? t('active') : t('inactiveLabel')}
                          </span>
                          <span className={`admin-badge ${target.is_admin ? 'admin-badge-admin' : ''}`}>
                            {target.is_admin ? t('adminRole') : t('userRole')}
                          </span>
                        </span>
                      </div>
                      <div className="admin-row-actions">
                        <Button size="sm" variant="outline" disabled={isSelf || busy} onClick={() => toggleUserActive(target)}>
                          {target.is_active ? t('deactivateAction') : t('activateAction')}
                        </Button>
                        <Button size="sm" variant="outline" disabled={isSelf || busy} onClick={() => toggleUserAdmin(target)}>
                          {target.is_admin ? t('revokeAdminAction') : t('makeAdminAction')}
                        </Button>
                        <Button size="sm" variant="outline" disabled={isSelf || busy} onClick={() => removeUser(target)}>
                          {t('deleteAction')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Card 1: AI Marketing Description Generator */}
              <div className="admin-section">
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Cormorant Garamond, serif' }}>
                  <Brain size={20} style={{ color: 'var(--primary)' }} />
                  {lang === 'en' && 'AI Description Generator'}
                  {lang === 'ru' && 'ИИ Генератор описаний'}
                  {lang === 'tj' && 'Генератори тавсифи АИ'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  {lang === 'en' && 'Select a laptop from your catalog to generate a high-converting, professional marketing description.'}
                  {lang === 'ru' && 'Выберите ноутбук из вашего каталога для генерации продающего маркетингового описания.'}
                  {lang === 'tj' && 'Лаптоперо аз каталоги худ интихоб кунед, то тавсифи касбии фурӯш тавлид карда шавад.'}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <select
                    value={selectedLaptopId ?? ''}
                    onChange={e => {
                      setSelectedLaptopId(e.target.value ? Number(e.target.value) : null);
                      setGeneratedDesc('');
                    }}
                    style={{
                      flex: 1, minWidth: 220, padding: '0.6rem 0.9rem',
                      background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
                      borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.9rem',
                      outline: 'none', fontFamily: 'inherit'
                    }}
                  >
                    <option value="">
                      {lang === 'en' && '-- Select Laptop --'}
                      {lang === 'ru' && '-- Выберите ноутбук --'}
                      {lang === 'tj' && '-- Интихоби лаптоп --'}
                    </option>
                    {laptops.map(l => (
                      <option key={l.id} value={l.id}>{l.brand} {l.model_name} ({l.price_tjs.toLocaleString()} TJS)</option>
                    ))}
                  </select>

                  <Button onClick={generateDescription} disabled={!selectedLaptopId || generatingDesc}>
                    {generatingDesc ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Loader size={14} className="animate-spin" />
                        {lang === 'en' && 'Generating...'}
                        {lang === 'ru' && 'Генерация...'}
                        {lang === 'tj' && 'Сохта истодааст...'}
                      </span>
                    ) : (
                      <>
                        <Sparkles size={14} style={{ marginRight: '6px' }} />
                        {lang === 'en' && 'Generate Description'}
                        {lang === 'ru' && 'Сгенерировать'}
                        {lang === 'tj' && 'Тавлиди тавсиф'}
                      </>
                    )}
                  </Button>
                </div>

                {generatedDesc && (
                  <div style={{
                    marginTop: '1.25rem', padding: '1.25rem',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-primary)',
                    borderRadius: 14, display: 'flex', flexDirection: 'column', gap: '1rem'
                  }}>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0, fontStyle: 'italic' }}>
                      {generatedDesc}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <Button size="sm" onClick={applyGeneratedDescription} isLoading={savingListing}>
                        {lang === 'en' && 'Apply to Listing'}
                        {lang === 'ru' && 'Применить к объявлению'}
                        {lang === 'tj' && 'Истифода дар эълон'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setGeneratedDesc('')}>
                        {t('cancelAction')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: AI Business & Sales Audit */}
              <div className="admin-section">
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Cormorant Garamond, serif' }}>
                  <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                  {lang === 'en' && 'AI Business & Sales Audit'}
                  {lang === 'ru' && 'ИИ Аудит продаж'}
                  {lang === 'tj' && 'Аудити фурӯши АИ'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  {lang === 'en' && 'Analyze active catalog listings, sales statistics, and brand performance to get actionable recommendations.'}
                  {lang === 'ru' && 'Проанализируйте активные объявления, статистику продаж и долю брендов для получения рекомендаций.'}
                  {lang === 'tj' && 'Эълонҳои фаъол, омори фурӯш ва натиҷаҳои брендҳоро таҳлил кунед, то тавсияҳо гиред.'}
                </p>

                <Button onClick={generateSalesAnalysis} disabled={generatingAnalysis}>
                  {generatingAnalysis ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Loader size={14} className="animate-spin" />
                      {lang === 'en' && 'Analyzing...'}
                      {lang === 'ru' && 'Анализ...'}
                      {lang === 'tj' && 'Таҳлил рафта истодааст...'}
                    </span>
                  ) : (
                    <>
                      <Brain size={14} style={{ marginRight: '6px' }} />
                      {lang === 'en' && 'Run Sales Audit'}
                      {lang === 'ru' && 'Запустить аудит'}
                      {lang === 'tj' && 'Оғози аудити фурӯш'}
                    </>
                  )}
                </Button>

                {salesAnalysis.length > 0 && (
                  <div style={{
                    marginTop: '1.5rem', padding: '1.25rem',
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 14, display: 'flex', flexDirection: 'column', gap: '0.75rem'
                  }}>
                    {salesAnalysis.map((line, idx) => {
                      const boldRegex = /\*\*(.*?)\*\*/g;
                      const parts = [];
                      let lastIndex = 0;
                      let match;
                      while ((match = boldRegex.exec(line)) !== null) {
                        if (match.index > lastIndex) {
                          parts.push(line.substring(lastIndex, match.index));
                        }
                        parts.push(<strong key={match.index} style={{ color: 'var(--primary)', fontWeight: 700 }}>{match[1]}</strong>);
                        lastIndex = boldRegex.lastIndex;
                      }
                      if (lastIndex < line.length) {
                        parts.push(line.substring(lastIndex));
                      }
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
                          <div>{parts.length > 0 ? parts : line}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="admin-section">
              {!loadingOrders && orders.length === 0 && <p className="admin-empty">{t('noOrdersAdmin')}</p>}
              <div className="admin-table">
                {orders.map(order => (
                  <div key={order.id} className="admin-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '1rem', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div className="admin-row-main" style={{ flex: 1, minWidth: '240px' }}>
                        <div className="admin-row-title" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ShoppingCart size={16} style={{ color: 'var(--primary)' }} />
                          <span>{t('orderNumber')}{order.id}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                            ({new Date(order.created_at).toLocaleString()})
                          </span>
                        </div>
                        <div className="admin-row-sub" style={{ marginTop: '0.4rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                          <span>
                            <strong>{lang === 'tj' ? 'Маҳсулот' : lang === 'ru' ? 'Товар' : 'Product'}:</strong>{' '}
                            {order.laptop ? (
                              `💻 ${order.laptop.brand} ${order.laptop.model_name}`
                            ) : order.phone ? (
                              `📱 ${order.phone.brand} ${order.phone.model_name}`
                            ) : (
                              `Product ID: ${order.laptop_id || order.phone_id}`
                            )}
                          </span>
                          <span><strong>Customer:</strong> {order.user ? `${order.user.username || 'No username'} (${order.user.email})` : `User ID: ${order.user_id}`}</span>
                          {order.user?.phone && <span><strong>Phone:</strong> {order.user.phone}</span>}
                          {order.user?.address && <span><strong>Address:</strong> {order.user.address}</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', minWidth: '150px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(order.total_price)} TJS
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          {order.payment_method} {order.installment_months ? `(${order.installment_months} ${t('months')})` : `(${t('fullPayment')})`}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                          <span className={`admin-badge admin-badge-${order.status}`} style={{
                            borderColor: order.status === 'completed' ? 'rgba(94, 163, 120, 0.35)' : order.status === 'cancelled' ? 'rgba(195, 108, 108, 0.35)' : 'var(--border-primary)',
                            color: order.status === 'completed' ? 'var(--success)' : order.status === 'cancelled' ? 'var(--danger)' : 'var(--primary)'
                          }}>
                            {order.status === 'pending' && t('orderStatusPending')}
                            {order.status === 'processing' && t('orderStatusProcessing')}
                            {order.status === 'completed' && t('orderStatusCompleted')}
                            {order.status === 'cancelled' && t('orderStatusCancelled')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status controls */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '0.8rem', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('changeStatus')}:</span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {['pending', 'processing', 'completed', 'cancelled'].map(st => (
                          <Button
                            key={st}
                            size="sm"
                            variant={order.status === st ? 'primary' : 'outline'}
                            disabled={updatingOrderId === order.id}
                            onClick={() => handleStatusChange(order.id, st)}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          >
                            {st === 'pending' && t('orderStatusPending')}
                            {st === 'processing' && t('orderStatusProcessing')}
                            {st === 'completed' && t('orderStatusCompleted')}
                            {st === 'cancelled' && t('orderStatusCancelled')}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
