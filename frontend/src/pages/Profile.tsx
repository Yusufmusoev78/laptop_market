import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, BarChart3, Mail, Building2, Laptop, Package, Plus, Phone, ShoppingCart, Smartphone, Wrench, Loader, MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useMarket } from '../context/MarketContext';
import { Button } from '../components/ui/Button';
import { LaptopCard } from '../components/ui/LaptopCard';
import { PhoneCard } from '../components/ui/PhoneCard';
import { createLaptop, getMyLaptops, getLaptops, recordSale, Laptop as LaptopType, LaptopCreateInput } from '../api/laptops';
import { createPhone, getMyPhones, getPhones, recordPhoneSale, Phone as PhoneType, PhoneCreateInput } from '../api/phones';
import { updateProfile, ProfileUpdateInput } from '../api/auth';
import { getMyBrands, Brand } from '../api/brands';
import { getMyOrders, Order } from '../api/orders';
import { RepairChatWindow } from '../components/ui/RepairChatWindow';
import { useNotifications } from '../context/NotificationsContext';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import './Profile.css';

const emptyLaptopForm: Omit<LaptopCreateInput, 'brand_id'> = {
  model_name: '', cpu: '', gpu: '',
  ram_gb: 8, storage_gb: 256, price_tjs: 0, stock_quantity: 1,
  keyboard_layout: 'English/Cyrillic', warranty_months: 12, description: '',
};

const emptyPhoneForm: Omit<PhoneCreateInput, 'brand_id'> = {
  model_name: '', cpu: '',
  ram_gb: 8, storage_gb: 256, screen_size_inches: 6.7, battery_capacity_mah: 5000,
  color: '', price_tjs: 0, stock_quantity: 1,
  warranty_months: 12, description: '',
};

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] } }),
};

export const Profile: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { t, lang } = useLang();
  const { marketMode } = useMarket();
  const { registerListener } = useNotifications();
  const navigate = useNavigate();

  const [myLaptops, setMyLaptops] = useState<LaptopType[]>([]);
  const [myPhones, setMyPhones] = useState<PhoneType[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  
  const [form, setForm] = useState<LaptopCreateInput>({ ...emptyLaptopForm, brand_id: 0 });
  const [phoneForm, setPhoneForm] = useState<PhoneCreateInput>({ ...emptyPhoneForm, brand_id: 0 });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [saleQuantities, setSaleQuantities] = useState<Record<number, number>>({});
  const [saleBusyId, setSaleBusyId] = useState<number | null>(null);
  const [saleMessage, setSaleMessage] = useState<{ id: number; text: string } | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileUpdateInput>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [repairTickets, setRepairTickets] = useState<any[]>([]);
  const [loadingRepairs, setLoadingRepairs] = useState(true);
  const [activeChatTicket, setActiveChatTicket] = useState<any | null>(null);

  const [likedLaptops, setLikedLaptops] = useState<LaptopType[]>([]);
  const [likedPhones, setLikedPhones] = useState<PhoneType[]>([]);
  const [loadingLiked, setLoadingLiked] = useState(true);

  const loadLikedItems = async () => {
    try {
      setLoadingLiked(true);
      const saved = localStorage.getItem('liked-items');
      if (!saved) {
        setLikedLaptops([]);
        setLikedPhones([]);
        return;
      }
      const parsed = JSON.parse(saved);
      const likedLaptopIds = parsed.laptops || [];
      const likedPhoneIds = parsed.phones || [];

      if (likedLaptopIds.length === 0 && likedPhoneIds.length === 0) {
        setLikedLaptops([]);
        setLikedPhones([]);
        return;
      }

      const [allLaptops, allPhones] = await Promise.all([
        getLaptops().catch(() => []),
        getPhones().catch(() => [])
      ]);

      setLikedLaptops(allLaptops.filter(l => likedLaptopIds.includes(l.id)));
      setLikedPhones(allPhones.filter(p => likedPhoneIds.includes(p.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLiked(false);
    }
  };

  useEffect(() => {
    getMyLaptops().then(setMyLaptops).catch(() => {}).finally(() => setLoadingListings(false));
    getMyPhones().then(setMyPhones).catch(() => {});
    getMyBrands().then(list => {
      setBrands(list);
      if (list.length > 0) {
        setForm(f => ({ ...f, brand_id: list[0].id }));
        setPhoneForm(f => ({ ...f, brand_id: list[0].id }));
      }
    }).catch(() => {}).finally(() => setLoadingBrands(false));
    getMyOrders().then(setOrders).catch(() => {}).finally(() => setLoadingOrders(false));
    apiClient.get('/repairs/').then(res => setRepairTickets(res.data)).catch(() => {}).finally(() => setLoadingRepairs(false));
    
    // Load liked
    loadLikedItems();

    const handleStorageChange = () => {
      loadLikedItems();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (user) setProfileForm({ email: user.email, phone: user.phone ?? '', address: user.address ?? '', role: user.role });
  }, [user]);

  useEffect(() => {
    const unsubClaimed = registerListener('repair_ticket_claimed', (data) => {
      setRepairTickets(prev =>
        prev.map(t => (t.id === data.repair_id ? { ...t, status: data.status, usto_id: data.usto_id } : t))
      );
      toast.success(lang === 'en' ? 'A technician has claimed your repair request!' : 'Усто дархости таъмири шуморо қабул кард!');
    });
    return () => unsubClaimed();
  }, [registerListener, lang]);

  const handleProfileChange = (field: keyof ProfileUpdateInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setProfileForm(f => ({ ...f, [field]: e.target.value }));

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSaved(false);
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      await refreshUser();
      setProfileSaved(true);
      setIsEditing(false);
    } catch {
      setProfileError(t('profileUpdateFailed'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChange = (field: keyof LaptopCreateInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { value, type } = e.target;
    setForm(f => ({ ...f, [field]: type === 'number' || field === 'brand_id' ? Number(value) : value }));
  };

  const handlePhoneChange = (field: keyof PhoneCreateInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { value, type } = e.target;
    setPhoneForm(f => ({ ...f, [field]: type === 'number' || field === 'brand_id' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);
    try {
      if (marketMode === 'laptop') {
        const created = await createLaptop(form);
        setMyLaptops(prev => [created, ...prev]);
        setForm({ ...emptyLaptopForm, brand_id: brands[0]?.id ?? 0 });
      } else {
        const created = await createPhone(phoneForm);
        setMyPhones(prev => [created, ...prev]);
        setPhoneForm({ ...emptyPhoneForm, brand_id: brands[0]?.id ?? 0 });
      }
      setSuccess(true);
    } catch {
      setError(t('listingFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordSaleLaptop = async (laptop: LaptopType) => {
    const quantity = saleQuantities[laptop.id] ?? 1;
    setSaleBusyId(laptop.id);
    setSaleMessage(null);
    try {
      const updated = await recordSale(laptop.id, quantity);
      setMyLaptops(prev => prev.map(l => (l.id === laptop.id ? updated : l)));
      setSaleMessage({ id: laptop.id, text: t('saleRecorded') });
    } catch {
      setSaleMessage({ id: laptop.id, text: t('saleRecordFailed') });
    } finally {
      setSaleBusyId(null);
    }
  };

  const handleRecordSalePhone = async (phone: PhoneType) => {
    const quantity = saleQuantities[phone.id] ?? 1;
    setSaleBusyId(phone.id);
    setSaleMessage(null);
    try {
      const updated = await recordPhoneSale(phone.id, quantity);
      setMyPhones(prev => prev.map(p => (p.id === phone.id ? updated : p)));
      setSaleMessage({ id: phone.id, text: t('saleRecorded') });
    } catch {
      setSaleMessage({ id: phone.id, text: t('saleRecordFailed') });
    } finally {
      setSaleBusyId(null);
    }
  };

  if (!user) return null;

  const avatarLetter = (user.username || user.email).charAt(0).toUpperCase();

  const editLabel = lang === 'tj' ? 'Таҳрири профил' : lang === 'ru' ? 'Редактировать профиль' : 'Edit Profile';
  const cancelLabel = lang === 'tj' ? 'Бекор кардан' : lang === 'ru' ? 'Отмена' : 'Cancel';

  return (
    <div className="profile-page">
      <motion.div 
        className="profile-unified-card" 
        initial="hidden" animate="show" custom={0} variants={sectionVariants}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: 24,
          padding: '2.5rem',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-glow)',
          alignItems: 'stretch'
        }}
      >
        {/* Left Side: Avatar, name, status, buttons */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid var(--border)', paddingRight: '2rem' }} className="profile-card-left">
          <div>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div className="profile-avatar" style={{ margin: 0, width: 80, height: 80, fontSize: '2rem' }}>{avatarLetter}</div>
              <div>
                <h1 className="profile-title" style={{ fontSize: '1.6rem', margin: 0 }}>{user.username || t('noUsernameSet')}</h1>
                <p className="profile-hero-email" style={{ margin: '0.2rem 0' }}>{user.email}</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  {user.role === 'usto' ? (
                    <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      🛠️ {lang === 'tj' ? 'Усто' : lang === 'ru' ? 'Мастер' : 'Usto'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#3b82f6', background: 'rgba(59,130,246,0.12)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      🛒 {lang === 'tj' ? 'Харидор' : lang === 'ru' ? 'Покупатель' : 'Buyer'}
                    </span>
                  )}
                  {user.is_admin && <span className="admin-badge admin-badge-admin" style={{ margin: 0 }}>{t('adminRole')}</span>}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {t('memberSince')} {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link to="/my-stats"><Button variant="outline" size="sm"><BarChart3 size={14} /> {t('myStatsTitle')}</Button></Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={14} /> {t('logout')}
            </Button>
          </div>
        </div>

        {/* Right Side: Account Details & Editing Form */}
        <div style={{ flex: '2 2 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="profile-card-right">
          <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontFamily: 'Sora, sans-serif' }}>
            <Mail size={16} style={{ color: 'var(--primary)' }} />
            {t('accountInfo')}
          </h2>

          {profileSaved && <div className="listing-success" style={{ margin: 0 }}>{t('profileUpdated')}</div>}
          {profileError && <div className="listing-error" style={{ margin: 0 }}>{profileError}</div>}

          {isEditing ? (
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'space-between' }}>
              <div className="listing-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="listing-form-field">
                  <label htmlFor="p-email">{t('emailLabel')}</label>
                  <input id="p-email" type="email" required value={profileForm.email ?? ''} onChange={handleProfileChange('email')} style={{ borderRadius: 12 }} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-phone">{t('phoneLabel')}</label>
                  <input id="p-phone" type="tel" value={profileForm.phone ?? ''} onChange={handleProfileChange('phone')} style={{ borderRadius: 12 }} />
                </div>
                <div className="listing-form-field full-width" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="p-address">{t('addressLabel')}</label>
                  <input id="p-address" value={profileForm.address ?? ''} onChange={handleProfileChange('address')} style={{ borderRadius: 12 }} />
                </div>
                <div className="listing-form-field full-width" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="p-role">{lang === 'tj' ? 'Нақши корбар' : lang === 'ru' ? 'Роль пользователя' : 'User Role'}</label>
                  <select
                    id="p-role"
                    value={profileForm.role ?? 'buyer'}
                    onChange={e => setProfileForm(f => ({ ...f, role: e.target.value }))}
                    style={{
                      borderRadius: 12,
                      padding: '0.65rem',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      width: '100%',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      outline: 'none'
                    }}
                  >
                    <option value="buyer">🛒 {lang === 'tj' ? 'Харидор (Маркет)' : lang === 'ru' ? 'Покупатель (Маркет)' : 'Buyer (Market Client)'}</option>
                    <option value="usto">🛠️ {lang === 'tj' ? 'Усто (Таъмиркор)' : lang === 'ru' ? 'Мастер (Усто)' : 'Master (Usto Technician)'}</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Button type="submit" size="sm" isLoading={savingProfile}>
                  {t('saveProfile')}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  {cancelLabel}
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, justifyContent: 'space-between' }}>
              <div className="profile-info-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('emailLabel')}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('phoneLabel')}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user.phone || '—'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('addressLabel')}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user.address || '—'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{lang === 'tj' ? 'Нақш' : lang === 'ru' ? 'Роль' : 'Role'}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>
                    {user.role === 'usto' ? (lang === 'tj' ? 'Усто (Таъмиркор)' : lang === 'ru' ? 'Мастер' : 'Master') : (lang === 'tj' ? 'Харидор' : lang === 'ru' ? 'Покупатель' : 'Buyer')}
                  </span>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} size="sm" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
                {editLabel}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div className="profile-section" initial="hidden" animate="show" custom={1} variants={sectionVariants}>
        <h2 className="profile-section-title">
          <Heart size={16} style={{ color: '#ef4444', marginRight: '8px', verticalAlign: 'middle' }} fill="#ef4444" />
          {lang === 'tj' ? 'Маҳсулоти писандида (Лайкҳо)' : lang === 'ru' ? 'Понравившиеся товары' : 'Liked Products'}
        </h2>
        {loadingLiked ? (
          <div className="profile-empty">
            <Loader className="spin-icon" />
            <p>{lang === 'en' ? 'Loading liked products...' : 'Боркунии рӯйхати писандидаҳо...'}</p>
          </div>
        ) : likedLaptops.length === 0 && likedPhones.length === 0 ? (
          <div className="profile-empty">
            <Heart size={26} style={{ color: 'var(--text-muted)' }} />
            <p>{lang === 'en' ? 'No liked products yet. Like computers or phones in the catalog!' : 'Ягон маҳсулот ҳанӯз писанд наомадааст.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {likedLaptops.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Laptop size={14} style={{ color: 'var(--primary)' }} />
                  {lang === 'en' ? 'Liked Laptops' : 'Ноутбукҳои писандида'}
                </h3>
                <div className="my-listings-grid">
                  {likedLaptops.map(l => (
                    <LaptopCard key={l.id} laptop={l} />
                  ))}
                </div>
              </div>
            )}
            {likedPhones.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone size={14} style={{ color: 'var(--primary)' }} />
                  {lang === 'en' ? 'Liked Phones' : 'Телефонҳои писандида'}
                </h3>
                <div className="my-listings-grid">
                  {likedPhones.map(p => (
                    <PhoneCard key={p.id} phone={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <motion.div className="profile-section" initial="hidden" animate="show" custom={2} variants={sectionVariants}>
        <h2 className="profile-section-title"><Building2 size={16} /> {t('myBrands')}</h2>

        {!loadingBrands && brands.length === 0 && (
          <div className="profile-empty">
            <Building2 size={26} />
            <p>{t('noBrandsYet')}</p>
          </div>
        )}
        {brands.length > 0 && (
          <ul className="my-brands-list">
            {brands.map(b => (
              <li key={b.id}>
                <span className="my-brands-avatar">{b.name.charAt(0).toUpperCase()}</span>
                <span className="my-brands-info">
                  <span className="my-brands-name">{b.name}</span>
                  <span className="my-brands-contact"><Phone size={11} /> {b.contact_phone} · <Mail size={11} /> {b.support_email}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link to="/brands/new"><Button variant="outline" size="sm"><Plus size={14} /> {t('registerBrand')}</Button></Link>
      </motion.div>

      <motion.div className="profile-section" initial="hidden" animate="show" custom={3} variants={sectionVariants}>
        <h2 className="profile-section-title">
          {marketMode === 'laptop' ? <Laptop size={16} /> : <Smartphone size={16} />}
          {' '}
          {marketMode === 'laptop' ? t('addLaptopListing') : t('addPhoneListing')}
        </h2>

        {success && <div className="listing-success">{t('listingAdded')}</div>}
        {error && <div className="listing-error">{error}</div>}

        {!loadingBrands && brands.length === 0 && (
          <div className="profile-empty">
            {marketMode === 'laptop' ? <Laptop size={26} /> : <Smartphone size={26} />}
            <p>{t('registerBrandFirst')}</p>
          </div>
        )}

        {brands.length > 0 && (
          <form onSubmit={handleSubmit}>
            {marketMode === 'laptop' ? (
              <div className="listing-form-grid">
                <div className="listing-form-field">
                  <label htmlFor="f-brand">{t('selectBrand')}</label>
                  <select id="f-brand" required value={form.brand_id} onChange={handleChange('brand_id')}>
                    <option value={0} disabled>{t('selectBrand')}</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="listing-form-field">
                  <label htmlFor="f-model">{t('modelNameLabel')}</label>
                  <input id="f-model" required value={form.model_name} onChange={handleChange('model_name')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="f-cpu">{t('cpuLabel')}</label>
                  <input id="f-cpu" required value={form.cpu} onChange={handleChange('cpu')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="f-gpu">{t('gpuLabel')}</label>
                  <input id="f-gpu" value={form.gpu} onChange={handleChange('gpu')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="f-ram">{t('ramLabel')}</label>
                  <input id="f-ram" type="number" min={1} required value={form.ram_gb} onChange={handleChange('ram_gb')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="f-storage">{t('storageLabel')}</label>
                  <input id="f-storage" type="number" min={1} required value={form.storage_gb} onChange={handleChange('storage_gb')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="f-price">{t('priceLabel')}</label>
                  <input id="f-price" type="number" min={1} required value={form.price_tjs} onChange={handleChange('price_tjs')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="f-stock">{t('stockLabel')}</label>
                  <input id="f-stock" type="number" min={0} required value={form.stock_quantity} onChange={handleChange('stock_quantity')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="f-warranty">{t('warrantyMonthsLabel')}</label>
                  <input id="f-warranty" type="number" min={0} required value={form.warranty_months} onChange={handleChange('warranty_months')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="f-kb">{t('keyboardLayoutLabel')}</label>
                  <input id="f-kb" required value={form.keyboard_layout} onChange={handleChange('keyboard_layout')} />
                </div>
                <div className="listing-form-field full-width">
                  <label htmlFor="f-desc">{t('descriptionOptional')}</label>
                  <textarea id="f-desc" value={form.description} onChange={handleChange('description')} />
                </div>
              </div>
            ) : (
              <div className="listing-form-grid">
                <div className="listing-form-field">
                  <label htmlFor="p-brand">{t('selectBrand')}</label>
                  <select id="p-brand" required value={phoneForm.brand_id} onChange={handlePhoneChange('brand_id')}>
                    <option value={0} disabled>{t('selectBrand')}</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-model">{t('modelNameLabel')}</label>
                  <input id="p-model" required value={phoneForm.model_name} onChange={handlePhoneChange('model_name')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-cpu">{t('cpuLabel')}</label>
                  <input id="p-cpu" required value={phoneForm.cpu} onChange={handlePhoneChange('cpu')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-color">{t('colorLabel')}</label>
                  <input id="p-color" required value={phoneForm.color} onChange={handlePhoneChange('color')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-ram">{t('ramLabel')}</label>
                  <input id="p-ram" type="number" min={1} required value={phoneForm.ram_gb} onChange={handlePhoneChange('ram_gb')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-storage">{t('storageLabel')}</label>
                  <input id="p-storage" type="number" min={1} required value={phoneForm.storage_gb} onChange={handlePhoneChange('storage_gb')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-screen">{t('screenSizeLabel')}</label>
                  <input id="p-screen" type="number" step="0.01" min={1} required value={phoneForm.screen_size_inches} onChange={handlePhoneChange('screen_size_inches')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-battery">{t('batteryCapacityLabel')}</label>
                  <input id="p-battery" type="number" min={1} required value={phoneForm.battery_capacity_mah} onChange={handlePhoneChange('battery_capacity_mah')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-price">{t('priceLabel')}</label>
                  <input id="p-price" type="number" min={1} required value={phoneForm.price_tjs} onChange={handlePhoneChange('price_tjs')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-stock">{t('stockLabel')}</label>
                  <input id="p-stock" type="number" min={0} required value={phoneForm.stock_quantity} onChange={handlePhoneChange('stock_quantity')} />
                </div>
                <div className="listing-form-field">
                  <label htmlFor="p-warranty">{t('warrantyMonthsLabel')}</label>
                  <input id="p-warranty" type="number" min={0} required value={phoneForm.warranty_months} onChange={handlePhoneChange('warranty_months')} />
                </div>
                <div className="listing-form-field full-width">
                  <label htmlFor="p-desc">{t('descriptionOptional')}</label>
                  <textarea id="p-desc" value={phoneForm.description} onChange={handlePhoneChange('description')} />
                </div>
              </div>
            )}

            <Button type="submit" className="listing-form-submit" isLoading={submitting}>
              {marketMode === 'laptop' ? t('submitListing') : (lang === 'tj' ? 'Иловаи телефон' : lang === 'ru' ? 'Добавить телефон' : 'Add Phone')}
            </Button>
          </form>
        )}
      </motion.div>

      <motion.div className="profile-section" initial="hidden" animate="show" custom={4} variants={sectionVariants}>
        <h2 className="profile-section-title"><Package size={16} /> {t('myListings')}</h2>
        
        {marketMode === 'laptop' ? (
          <>
            {!loadingListings && myLaptops.length === 0 && (
              <div className="profile-empty">
                <Package size={26} />
                <p>{t('noListingsYet')}</p>
              </div>
            )}
            {myLaptops.length > 0 && (
              <div className="my-listings-grid">
                {myLaptops.map(l => (
                  <div key={l.id} className="my-listing-item">
                    <LaptopCard laptop={l} />
                    <div className="record-sale-row">
                      <input
                        type="number" min={1} max={l.stock_quantity || undefined}
                        value={saleQuantities[l.id] ?? 1}
                        onChange={e => setSaleQuantities(q => ({ ...q, [l.id]: Number(e.target.value) }))}
                        aria-label={t('quantityLabel')}
                      />
                      <Button
                        size="sm" variant="outline" disabled={saleBusyId === l.id || l.stock_quantity <= 0}
                        onClick={() => handleRecordSaleLaptop(l)}
                      >
                        {t('recordSale')}
                      </Button>
                    </div>
                    {saleMessage?.id === l.id && <span className="sale-message">{saleMessage.text}</span>}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {!loadingListings && myPhones.length === 0 && (
              <div className="profile-empty">
                <Package size={26} />
                <p>{t('noListingsYet')}</p>
              </div>
            )}
            {myPhones.length > 0 && (
              <div className="my-listings-grid">
                {myPhones.map(p => (
                  <div key={p.id} className="my-listing-item">
                    <PhoneCard phone={p} />
                    <div className="record-sale-row">
                      <input
                        type="number" min={1} max={p.stock_quantity || undefined}
                        value={saleQuantities[p.id] ?? 1}
                        onChange={e => setSaleQuantities(q => ({ ...q, [p.id]: Number(e.target.value) }))}
                        aria-label={t('quantityLabel')}
                      />
                      <Button
                        size="sm" variant="outline" disabled={saleBusyId === p.id || p.stock_quantity <= 0}
                        onClick={() => handleRecordSalePhone(p)}
                      >
                        {t('recordSale')}
                      </Button>
                    </div>
                    {saleMessage?.id === p.id && <span className="sale-message">{saleMessage.text}</span>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      <motion.div className="profile-section" initial="hidden" animate="show" custom={5} variants={sectionVariants}>
        <h2 className="profile-section-title">
          <ShoppingCart size={16} style={{ color: 'var(--primary)', marginRight: '8px', verticalAlign: 'middle' }} />
          {t('myOrders')}
        </h2>
        {!loadingOrders && orders.length === 0 && (
          <div className="profile-empty">
            <ShoppingCart size={26} />
            <p>{t('noOrdersYet')}</p>
          </div>
        )}
        {orders.length > 0 && (
          <div className="orders-table-wrapper" style={{ overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1rem' }}>
            <table className="orders-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>{t('orderNumber')}</th>
                  <th style={{ padding: '0.75rem' }}>{lang === 'tj' ? 'Маҳсулот' : lang === 'ru' ? 'Товар' : 'Product'}</th>
                  <th style={{ padding: '0.75rem' }}>{t('orderDate')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('paymentMethod')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('installmentPlan')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('orderTotal')}</th>
                  <th style={{ padding: '0.75rem' }}>{t('orderStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>#{o.id}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {o.laptop ? (
                        <Link to={`/catalog/${o.laptop.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Laptop size={14} /> {o.laptop.brand} {o.laptop.model_name}
                        </Link>
                      ) : o.phone ? (
                        <Link to={`/catalog/phone/${o.phone.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Smartphone size={14} /> {o.phone.brand} {o.phone.model_name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem', textTransform: 'uppercase' }}>{o.payment_method}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {o.installment_months ? `${o.installment_months} ${t('months')}` : t('fullPayment')}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(o.total_price)} TJS
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`admin-badge admin-badge-${o.status}`} style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: o.status === 'completed' ? 'rgba(94, 163, 120, 0.35)' : o.status === 'cancelled' ? 'rgba(195, 108, 108, 0.35)' : 'var(--border-primary)',
                        color: o.status === 'completed' ? 'var(--success)' : o.status === 'cancelled' ? 'var(--danger)' : 'var(--primary)'
                      }}>
                        {o.status === 'pending' && t('orderStatusPending')}
                        {o.status === 'processing' && t('orderStatusProcessing')}
                        {o.status === 'completed' && t('orderStatusCompleted')}
                        {o.status === 'cancelled' && t('orderStatusCancelled')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <motion.div className="profile-section" initial="hidden" animate="show" custom={6} variants={sectionVariants}>
        <h2 className="profile-section-title">
          <Wrench size={16} style={{ color: 'var(--primary)', marginRight: '8px', verticalAlign: 'middle' }} />
          {lang === 'tj' ? 'Дархостҳои таъмири ман' : lang === 'ru' ? 'Мои заявки на ремонт' : 'My Repair Requests'}
        </h2>
        {loadingRepairs ? (
          <div className="profile-empty">
            <Loader className="spin-icon" />
            <p>{lang === 'en' ? 'Loading repair requests...' : 'Боркунии рӯйхати дархостҳо...'}</p>
          </div>
        ) : repairTickets.length === 0 ? (
          <div className="profile-empty">
            <Wrench size={26} />
            <p>{lang === 'en' ? 'No repair requests submitted yet.' : 'Шумо то ҳол дархости таъмир нафиристодаед.'}</p>
            <Link to="/repair"><Button size="sm" variant="outline" style={{ marginTop: '0.5rem' }}>{lang === 'en' ? 'Request Repair' : 'Фармоиши таъмир'}</Button></Link>
          </div>
        ) : (
          <div className="orders-table-wrapper" style={{ overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1rem' }}>
            <table className="orders-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>{lang === 'tj' ? 'Чипта' : lang === 'ru' ? 'Тикет' : 'Ticket ID'}</th>
                  <th style={{ padding: '0.75rem' }}>{lang === 'tj' ? 'Дастгоҳ' : lang === 'ru' ? 'Устройство' : 'Device'}</th>
                  <th style={{ padding: '0.75rem' }}>{lang === 'tj' ? 'Тавсифи таъмир' : lang === 'ru' ? 'Описание ремонта' : 'Repair Description'}</th>
                  <th style={{ padding: '0.75rem' }}>{lang === 'tj' ? 'Нархи тахминӣ' : lang === 'ru' ? 'Эст. Стоимость' : 'Est. Cost'}</th>
                  <th style={{ padding: '0.75rem' }}>{lang === 'tj' ? 'Ҳолат' : lang === 'ru' ? 'Статус' : 'Status'}</th>
                  <th style={{ padding: '0.75rem' }}>{lang === 'tj' ? 'Чат' : lang === 'ru' ? 'Чат' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {repairTickets.map(ticket => (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>#{ticket.id}</td>
                    <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{ticket.device_type}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ticket.description}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{ticket.estimated_cost} TJS</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`admin-badge admin-badge-${ticket.status}`} style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: ticket.status === 'completed' ? 'rgba(94, 163, 120, 0.35)' : ticket.status === 'pending' ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-primary)',
                        color: ticket.status === 'completed' ? 'var(--success)' : ticket.status === 'pending' ? '#f59e0b' : 'var(--primary)'
                      }}>
                        {ticket.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Button
                        size="sm"
                        onClick={() => setActiveChatTicket(ticket)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <MessageSquare size={12} /> {lang === 'en' ? 'Chat with Usto' : 'Чат бо усто'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {activeChatTicket && (
        <RepairChatWindow
          repairId={activeChatTicket.id}
          clientName={activeChatTicket.name}
          clientPhone={activeChatTicket.phone}
          deviceType={activeChatTicket.device_type}
          estimatedCost={activeChatTicket.estimated_cost}
          onClose={() => {
            setActiveChatTicket(null);
            apiClient.get('/repairs/').then(res => setRepairTickets(res.data));
          }}
        />
      )}
    </div>
  );
};
