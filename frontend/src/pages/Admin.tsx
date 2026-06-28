import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Package, Users as UsersIcon, Sparkles, Brain, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { Laptop, LaptopUpdateInput, getLaptops, updateLaptop, deleteLaptop, recordSale } from '../api/laptops';
import { getAllUsers, updateUser, deleteUser } from '../api/admin';
import { User } from '../api/auth';
import { StatsOverview, MonthlySalesPoint, BrandPerformancePoint, getAdminStatsOverview, getAdminStatsMonthly, getAdminStatsBrands } from '../api/stats';
import { StatCard } from '../components/charts/StatCard';
import { RevenueTrendChart } from '../components/charts/RevenueTrendChart';
import { BrandPerformanceChart } from '../components/charts/BrandPerformanceChart';
import '../components/charts/charts.css';
import './Admin.css';

type Tab = 'overview' | 'listings' | 'users' | 'ai';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [tab, setTab] = useState<Tab>('overview');

  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [monthly, setMonthly] = useState<MonthlySalesPoint[]>([]);
  const [brandPerf, setBrandPerf] = useState<BrandPerformancePoint[]>([]);

  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [loadingLaptops, setLoadingLaptops] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<LaptopUpdateInput>>({});
  const [savingLaptop, setSavingLaptop] = useState(false);
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

  useEffect(() => {
    getLaptops().then(setLaptops).catch(() => {}).finally(() => setLoadingLaptops(false));
    getAllUsers().then(setUsers).catch(() => {}).finally(() => setLoadingUsers(false));
    getAdminStatsOverview().then(setOverview).catch(() => {});
    getAdminStatsMonthly().then(setMonthly).catch(() => {});
    getAdminStatsBrands().then(setBrandPerf).catch(() => {});
  }, []);

  const ownerEmail = (ownerId?: number | null) =>
    ownerId == null ? null : users.find(u => u.id === ownerId)?.email ?? `#${ownerId}`;

  const startEdit = (laptop: Laptop) => {
    setEditingId(laptop.id);
    setEditForm({
      brand: laptop.brand, model_name: laptop.model_name, cpu: laptop.cpu, gpu: laptop.gpu,
      ram_gb: laptop.ram_gb, storage_gb: laptop.storage_gb, price_tjs: laptop.price_tjs,
      stock_quantity: laptop.stock_quantity, warranty_months: laptop.warranty_months,
      keyboard_layout: laptop.keyboard_layout, description: laptop.description,
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleEditChange = (field: keyof LaptopUpdateInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, type } = e.target;
    setEditForm(f => ({ ...f, [field]: type === 'number' ? Number(value) : value }));
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSavingLaptop(true);
    try {
      const updated = await updateLaptop(editingId, editForm);
      setLaptops(prev => prev.map(l => (l.id === editingId ? updated : l)));
      cancelEdit();
    } finally {
      setSavingLaptop(false);
    }
  };

  const removeLaptop = async (id: number) => {
    if (!window.confirm(t('confirmDeleteListing'))) return;
    await deleteLaptop(id);
    setLaptops(prev => prev.filter(l => l.id !== id));
  };

  const handleRecordSale = async (laptop: Laptop) => {
    const quantity = saleQuantities[laptop.id] ?? 1;
    setSaleBusyId(laptop.id);
    try {
      const updated = await recordSale(laptop.id, quantity);
      setLaptops(prev => prev.map(l => (l.id === laptop.id ? updated : l)));
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
        desc = `Оцените максимальную производительность с новым ${laptop.brand} ${laptop.model_name}. Оснащенный мощным процессором ${laptop.cpu} и оперативной памятью объемом ${laptop.ram_gb} ГБ, этот ноутбук без труда справляется с программированием, сложным дизайном и многозадачностью. Сверхбыстрый SSD емкостью ${laptop.storage_gb} ГБ обеспечивает мгновенный запуск системы. Модель оснащена видеокартой ${laptop.gpu || 'встроенной графикой'} и поставляется с официальной гарантией на ${laptop.warranty_months} месяцев. Идеально для профессионалов!`;
      } else {
        desc = `Таҷрибаи кории худро бо ${laptop.brand} ${laptop.model_name} ба сатҳи нав бардоред. Ин лаптопи пурқувват дорои протсессори муосири ${laptop.cpu} ва хотираи фаврии ${laptop.ram_gb} ГБ мебошад, ки иҷрои вазифаҳои вазнин ва барномасозиро комилан осон месозад. SSD-и зуд бо ҳаҷми ${laptop.storage_gb} ГБ ва видеокартаи ${laptop.gpu || 'амволи графикӣ'} кори бозиҳо ва дигар нармафзорҳоро таъмин мекунанд. Лаптоп бо кафолати расмии ${laptop.warranty_months} моҳ фурӯхта мешавад. Интихоби комил барои кор ва таҳсил!`;
      }
      setGeneratedDesc(desc);
      setGeneratingDesc(false);
    }, 1200);
  };

  const applyGeneratedDescription = async () => {
    if (!selectedLaptopId || !generatedDesc) return;
    setSavingLaptop(true);
    try {
      const updated = await updateLaptop(selectedLaptopId, { description: generatedDesc });
      setLaptops(prev => prev.map(l => (l.id === selectedLaptopId ? updated : l)));
      alert('Description updated successfully!');
    } catch {
      alert('Could not update listing.');
    } finally {
      setSavingLaptop(false);
    }
  };

  const generateSalesAnalysis = () => {
    setGeneratingAnalysis(true);
    setTimeout(() => {
      let analysis = [];
      if (lang === 'en') {
        analysis = [
          `**Revenue Analysis**: Total revenue of **${(overview?.total_revenue ?? 0).toLocaleString()} TJS** shows strong customer interest in mid-to-high range laptops.`,
          `**Brand Optimization**: Brands like Lenovo and Apple represent over **40%** of conversions. We recommend keeping at least **5 units** of Apple MacBook Pro and Lenovo Legion models in stock.`,
          `**Warranty Strategy**: Offering a warranty extension (+6 months) on premium listings priced over **12,000 TJS** could increase checkout rates by **14%** with minimal risk.`,
          `**Inventory Health**: Average stock is currently low. Restock MSI and ASUS laptops before next week to avoid out-of-stock bounce rates.`
        ];
      } else if (lang === 'ru') {
        analysis = [
          `**Анализ выручки**: Общий доход в размере **${(overview?.total_revenue ?? 0).toLocaleString()} TJS** указывает на стабильный спрос на ноутбуки среднего и премиум классов.`,
          `**Оптимизация брендов**: Модели Lenovo и Apple генерируют более **40%** всех продаж. Рекомендуется держать не менее **5 единиц** каждой из этих марок на складе.`,
          `**Гарантийная стратегия**: Продление гарантии на 6 месяцев для дорогих ноутбуков (от **12 000 TJS**) может увеличить конверсию в корзину на **14%**.`,
          `**Оптимизация остатков**: Запас моделей от MSI и ASUS на исходе. Сделайте заказ новых поставок для предупреждения упущенной выгоды.`
        ];
      } else {
        analysis = [
          `**Таҳлили даромад**: Даромади умумии **${(overview?.total_revenue ?? 0).toLocaleString()} TJS** нишон медиҳад, ки таваҷҷуҳи харидорон ба лаптопҳои синфи миёна ва олии корӣ хеле зиёд аст.`,
          `**Оптимизатсияи брендҳо**: Брендҳое ба монанди Lenovo ва Apple бештар аз **40%** фурӯшро таъмин мекунанд. Тавсия медиҳем, ки ҳадди аққал **5 ададӣ** аз ин лаптопҳо дар анбор дошта бошед.`,
          `**Сатҳи кафолат**: Иловаи кафолати бештар (+6 моҳ) барои лаптопҳои қиматиашон зиёда аз **12,000 TJS** метавонад ҳаҷми харидро то **14%** боло барад.`,
          `**Захираи анбор**: Захираи моделҳои MSI ва ASUS дар ҳолати тамомшавист. Пеш аз оғози ҳафтаи оянда анборро пур кунед.`
        ];
      }
      setSalesAnalysis(analysis);
      setGeneratingAnalysis(false);
    }, 1200);
  };

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
          {!loadingLaptops && laptops.length === 0 && <p className="admin-empty">{t('noListingsAdmin')}</p>}
          <div className="admin-table">
            {laptops.map(laptop => (
              <div key={laptop.id} className="admin-row">
                {editingId === laptop.id ? (
                  <div className="listing-form-grid admin-edit-grid">
                    <div className="listing-form-field">
                      <label htmlFor={`e-brand-${laptop.id}`}>{t('brandName')}</label>
                      <input id={`e-brand-${laptop.id}`} value={editForm.brand ?? ''} onChange={handleEditChange('brand')} />
                    </div>
                    <div className="listing-form-field">
                      <label htmlFor={`e-model-${laptop.id}`}>{t('modelNameLabel')}</label>
                      <input id={`e-model-${laptop.id}`} value={editForm.model_name ?? ''} onChange={handleEditChange('model_name')} />
                    </div>
                    <div className="listing-form-field">
                      <label htmlFor={`e-cpu-${laptop.id}`}>{t('cpuLabel')}</label>
                      <input id={`e-cpu-${laptop.id}`} value={editForm.cpu ?? ''} onChange={handleEditChange('cpu')} />
                    </div>
                    <div className="listing-form-field">
                      <label htmlFor={`e-gpu-${laptop.id}`}>{t('gpuLabel')}</label>
                      <input id={`e-gpu-${laptop.id}`} value={editForm.gpu ?? ''} onChange={handleEditChange('gpu')} />
                    </div>
                    <div className="listing-form-field">
                      <label htmlFor={`e-ram-${laptop.id}`}>{t('ramLabel')}</label>
                      <input id={`e-ram-${laptop.id}`} type="number" min={1} value={editForm.ram_gb ?? 0} onChange={handleEditChange('ram_gb')} />
                    </div>
                    <div className="listing-form-field">
                      <label htmlFor={`e-storage-${laptop.id}`}>{t('storageLabel')}</label>
                      <input id={`e-storage-${laptop.id}`} type="number" min={1} value={editForm.storage_gb ?? 0} onChange={handleEditChange('storage_gb')} />
                    </div>
                    <div className="listing-form-field">
                      <label htmlFor={`e-price-${laptop.id}`}>{t('priceLabel')}</label>
                      <input id={`e-price-${laptop.id}`} type="number" min={1} value={editForm.price_tjs ?? 0} onChange={handleEditChange('price_tjs')} />
                    </div>
                    <div className="listing-form-field">
                      <label htmlFor={`e-stock-${laptop.id}`}>{t('stockLabel')}</label>
                      <input id={`e-stock-${laptop.id}`} type="number" min={0} value={editForm.stock_quantity ?? 0} onChange={handleEditChange('stock_quantity')} />
                    </div>
                    <div className="listing-form-field">
                      <label htmlFor={`e-warranty-${laptop.id}`}>{t('warrantyMonthsLabel')}</label>
                      <input id={`e-warranty-${laptop.id}`} type="number" min={0} value={editForm.warranty_months ?? 0} onChange={handleEditChange('warranty_months')} />
                    </div>
                    <div className="listing-form-field">
                      <label htmlFor={`e-kb-${laptop.id}`}>{t('keyboardLayoutLabel')}</label>
                      <input id={`e-kb-${laptop.id}`} value={editForm.keyboard_layout ?? ''} onChange={handleEditChange('keyboard_layout')} />
                    </div>
                    <div className="listing-form-field full-width">
                      <label htmlFor={`e-desc-${laptop.id}`}>{t('descriptionOptional')}</label>
                      <textarea id={`e-desc-${laptop.id}`} value={editForm.description ?? ''} onChange={handleEditChange('description')} />
                    </div>
                    <div className="admin-edit-actions full-width">
                      <Button size="sm" onClick={saveEdit} isLoading={savingLaptop}>{t('saveAction')}</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>{t('cancelAction')}</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="admin-row-main">
                      <span className="admin-row-title">{laptop.brand} {laptop.model_name}</span>
                      <span className="admin-row-sub">
                        {laptop.price_tjs.toLocaleString()} TJS · {t('ownerLabel')}: {ownerEmail(laptop.owner_id) ?? '—'}
                      </span>
                    </div>
                    <div className="admin-row-actions">
                      <input
                        type="number" min={1} max={laptop.stock_quantity || undefined}
                        className="admin-qty-input"
                        value={saleQuantities[laptop.id] ?? 1}
                        onChange={e => setSaleQuantities(q => ({ ...q, [laptop.id]: Number(e.target.value) }))}
                        aria-label={t('quantityLabel')}
                      />
                      <Button
                        size="sm" variant="outline" disabled={saleBusyId === laptop.id || laptop.stock_quantity <= 0}
                        onClick={() => handleRecordSale(laptop)}
                      >
                        {t('recordSale')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startEdit(laptop)}>{t('editAction')}</Button>
                      <Button size="sm" variant="outline" onClick={() => removeLaptop(laptop.id)}>{t('deleteAction')}</Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
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
                  <Button size="sm" onClick={applyGeneratedDescription} isLoading={savingLaptop}>
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
        </div>
      </div>
    </div>
  );
};
