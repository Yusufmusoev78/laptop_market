import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, BarChart3, Mail, Building2, Laptop, Package, Plus, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { LaptopCard } from '../components/ui/LaptopCard';
import { createLaptop, getMyLaptops, recordSale, Laptop as LaptopType, LaptopCreateInput } from '../api/laptops';
import { updateProfile, ProfileUpdateInput } from '../api/auth';
import { getMyBrands, Brand } from '../api/brands';
import './Profile.css';

const emptyForm: Omit<LaptopCreateInput, 'brand_id'> = {
  model_name: '', cpu: '', gpu: '',
  ram_gb: 8, storage_gb: 256, price_tjs: 0, stock_quantity: 1,
  keyboard_layout: 'English/Cyrillic', warranty_months: 12, description: '',
};

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] } }),
};

export const Profile: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [myLaptops, setMyLaptops] = useState<LaptopType[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [form, setForm] = useState<LaptopCreateInput>({ ...emptyForm, brand_id: 0 });
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

  useEffect(() => {
    getMyLaptops().then(setMyLaptops).catch(() => {}).finally(() => setLoadingListings(false));
    getMyBrands().then(setBrands).catch(() => {}).finally(() => setLoadingBrands(false));
  }, []);

  useEffect(() => {
    if (user) setProfileForm({ email: user.email, phone: user.phone ?? '', address: user.address ?? '' });
  }, [user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitting(true);
    try {
      const created = await createLaptop(form);
      setMyLaptops(prev => [created, ...prev]);
      setForm({ ...emptyForm, brand_id: brands[0]?.id ?? 0 });
      setSuccess(true);
    } catch {
      setError(t('listingFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordSale = async (laptop: LaptopType) => {
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

  if (!user) return null;

  const avatarLetter = (user.username || user.email).charAt(0).toUpperCase();
  const { lang } = useLang();
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
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.4rem' }}>
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
              </div>
              <Button onClick={() => setIsEditing(true)} size="sm" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
                {editLabel}
              </Button>
            </div>
          )}
        </div>
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
        <h2 className="profile-section-title"><Laptop size={16} /> {t('addLaptopListing')}</h2>

        {success && <div className="listing-success">{t('listingAdded')}</div>}
        {error && <div className="listing-error">{error}</div>}

        {!loadingBrands && brands.length === 0 && (
          <div className="profile-empty">
            <Laptop size={26} />
            <p>{t('registerBrandFirst')}</p>
          </div>
        )}

        {brands.length > 0 && (
        <form onSubmit={handleSubmit}>
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

          <Button type="submit" className="listing-form-submit" isLoading={submitting}>
            {t('submitListing')}
          </Button>
        </form>
        )}
      </motion.div>

      <motion.div className="profile-section" initial="hidden" animate="show" custom={4} variants={sectionVariants}>
        <h2 className="profile-section-title"><Package size={16} /> {t('myListings')}</h2>
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
                    onClick={() => handleRecordSale(l)}
                  >
                    {t('recordSale')}
                  </Button>
                </div>
                {saleMessage?.id === l.id && <span className="sale-message">{saleMessage.text}</span>}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
