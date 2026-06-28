import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, MemoryStick, Zap, ShieldCheck, Keyboard, ShoppingCart, ArrowLeft, Package, Laptop as LaptopIcon, CreditCard, Check } from 'lucide-react';
import { getLaptops, Laptop } from '../api/laptops';
import { getLaptopGallery } from '../utils/laptopImages';
import { LaptopCard } from '../components/ui/LaptopCard';
import { useLang } from '../context/LanguageContext';
import './LaptopDetail.css';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

export const LaptopDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLang();

  const [laptop,   setLaptop]   = useState<Laptop | null>(null);
  const [related,  setRelated]  = useState<Laptop[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [broken,   setBroken]   = useState<Set<number>>(new Set());
  const [installmentMonths, setInstallmentMonths] = useState<number>(12);
  const [selectedPayment, setSelectedPayment] = useState<string>('alif');

  const getMarkupPercent = (months: number) => {
    if (months === 3) return 0;
    if (months === 6) return 5;
    if (months === 12) return 12;
    if (months === 24) return 22;
    return 0;
  };

  const calculatedMonthly = useMemo(() => {
    if (!laptop) return 0;
    const price = laptop.price_tjs;
    if (installmentMonths === 3) return Math.round(price / 3);
    if (installmentMonths === 6) return Math.round((price * 1.05) / 6);
    if (installmentMonths === 12) return Math.round((price * 1.12) / 12);
    if (installmentMonths === 24) return Math.round((price * 1.22) / 24);
    return 0;
  }, [laptop, installmentMonths]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const numId = parseInt(id ?? '');
    if (isNaN(numId)) { navigate('/catalog'); return; }

    getLaptops().then(all => {
      const found = all.find(l => l.id === numId);
      if (!found) { navigate('/catalog'); return; }
      setLaptop(found);
      setRelated(
        all.filter(l => l.id !== numId && l.brand === found.brand).slice(0, 4)
          .concat(all.filter(l => l.id !== numId && l.brand !== found.brand).slice(0, Math.max(0, 4 - all.filter(l => l.brand === found.brand && l.id !== numId).length)))
          .slice(0, 4)
      );
    }).catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const gallery = useMemo(
    () => laptop ? getLaptopGallery(laptop.brand, laptop.model_name, 800) : [],
    [laptop],
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!laptop) return null;

  const allBroken = broken.size >= gallery.length;
  const inStock = laptop.stock_quantity > 0;

  const specs = [
    { icon: Cpu,         label: t('processor'),     value: laptop.cpu },
    { icon: MemoryStick, label: t('memory'),         value: `${laptop.ram_gb} GB RAM` },
    { icon: HardDrive,   label: t('storage'),        value: `${laptop.storage_gb} GB SSD` },
    { icon: Zap,         label: t('graphics'),       value: laptop.gpu || '—' },
    { icon: ShieldCheck, label: t('warrantyLabel'),  value: `${laptop.warranty_months} ${t('months')}` },
    { icon: Keyboard,    label: t('keyboardLayout'), value: laptop.keyboard_layout },
    { icon: Package,     label: 'Stock',             value: inStock ? `${laptop.stock_quantity} ${t('inStock')}` : t('outOfStock') },
  ];

  return (
    <motion.div
      className="detail-page animate-fade-in"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
    >
      {/* Back button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        {t('backToCatalog')}
      </button>

      {/* Main card */}
      <div className="detail-main">

        {/* Left — image gallery */}
        <div className="detail-image-wrap">
          <div className="detail-image-container">
            {!allBroken ? (
              <>
                {gallery.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${laptop.brand} ${laptop.model_name} — ${i + 1}`}
                    className="detail-image"
                    style={{ opacity: !broken.has(i) && i === activeImg ? 1 : 0 }}
                    onError={() => setBroken(prev => new Set(prev).add(i))}
                  />
                ))}
              </>
            ) : (
              <div className="detail-image-fallback">
                <LaptopIcon size={64} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <p>{laptop.brand} {laptop.model_name}</p>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {!allBroken && gallery.length > 1 && (
            <div className="detail-thumbs">
              {gallery.map((src, i) => (
                broken.has(i) ? null : (
                  <button
                    key={src}
                    className={`detail-thumb ${i === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Photo ${i + 1}`}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                )
              ))}
            </div>
          )}

          {/* Brand + stock */}
          <div className="detail-image-badges">
            <span className="detail-brand-badge">{laptop.brand}</span>
            <span className={`detail-stock-badge ${inStock ? 'in' : 'out'}`}>
              {inStock ? `${laptop.stock_quantity} ${t('inStock')}` : t('outOfStock')}
            </span>
          </div>
        </div>

        {/* Right — info */}
        <div className="detail-info">
          <h1 className="detail-title">{laptop.brand} {laptop.model_name}</h1>

          {laptop.description && (
            <p className="detail-desc">{laptop.description}</p>
          )}

          {/* Price */}
          <div className="detail-price-row">
            <div className="detail-price">
              <span className="detail-amount">
                {fmt(laptop.price_tjs)} <span className="detail-currency-suffix">TJS</span>
              </span>
            </div>
            <div className="detail-trust">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Check size={12} style={{ color: 'var(--primary)', marginRight: '4px' }} />
                {laptop.warranty_months} {t('monthsFull')} {t('warrantyLabel')}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Check size={12} style={{ color: 'var(--primary)', marginRight: '4px' }} />
                {t('deliveryCity')}
              </span>
            </div>
          </div>

          {/* Installment Calculator */}
          <div className="installment-box">
            <h3 className="installment-box-title">
              <CreditCard size={15} style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--primary)' }} />
              {t('installmentLabel')}
            </h3>
            
            <div className="installment-durations">
              {[3, 6, 12, 24].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`installment-duration-btn ${installmentMonths === m ? 'active' : ''}`}
                  onClick={() => setInstallmentMonths(m)}
                >
                  {m} {t('monthsText')} ({getMarkupPercent(m)}%)
                </button>
              ))}
            </div>

            <div className="installment-result">
              <span className="installment-result-label">{t('monthlyPay')}:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                <span className="installment-result-value">{fmt(calculatedMonthly)} TJS / {t('months')}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {lang === 'en' && (getMarkupPercent(installmentMonths) === 0 ? '0% markup / Salom' : `+${getMarkupPercent(installmentMonths)}% credit markup`)}
                  {lang === 'ru' && (getMarkupPercent(installmentMonths) === 0 ? 'Без наценки / Салом' : `+${getMarkupPercent(installmentMonths)}% наценка за кредит`)}
                  {lang === 'tj' && (getMarkupPercent(installmentMonths) === 0 ? 'Бе фоизи изофӣ / Салом' : `+${getMarkupPercent(installmentMonths)}% иловапулӣ барои кредит`)}
                </span>
              </div>
            </div>

            <div className="payment-providers">
              <span className="payment-providers-label">{t('paymentPartner')}:</span>
              <div className="payment-providers-list">
                {[
                  { id: 'alif', name: 'Alif' },
                  { id: 'humo', name: 'Humo' },
                  { id: 'eskhata', name: 'Eskhata' },
                  { id: 'dc', name: 'DC' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`payment-provider-btn ${p.id} ${selectedPayment === p.id ? 'active' : ''}`}
                    onClick={() => setSelectedPayment(p.id)}
                  >
                    <span className="provider-dot" />
                    {p.name}
                  </button>
                ))}
              </div>
              <p className="payment-provider-desc">
                {selectedPayment === 'alif' && t('payMethodAlif')}
                {selectedPayment === 'humo' && t('payMethodHumo')}
                {selectedPayment === 'eskhata' && t('payMethodEskhata')}
                {selectedPayment === 'dc' && t('payMethodDC')}
              </p>
            </div>
          </div>

          {/* Buy button */}
          <button
            className={`detail-buy-btn ${!inStock ? 'disabled' : ''}`}
            disabled={!inStock}
          >
            <ShoppingCart size={18} />
            {inStock ? t('addToCart') : t('outOfStockBtn')}
          </button>

          {/* Specs */}
          <div className="detail-specs-section">
            <h3 className="detail-specs-title">{t('specifications')}</h3>
            <div className="detail-specs-grid">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="detail-spec-row">
                  <div className="detail-spec-icon">
                    <Icon size={14} />
                  </div>
                  <div>
                    <div className="detail-spec-label">{label}</div>
                    <div className="detail-spec-value">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seller Brand Info Section */}
      <div style={{
        margin: '3rem 0 2rem 0',
        padding: '2rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-strong)',
        borderRadius: 24,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', minWidth: 280, flex: 1 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--gradient-brand)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Sora, sans-serif',
            boxShadow: '0 8px 16px rgba(197, 168, 128, 0.2)'
          }}>
            Comp
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
              CompTJ
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4, maxWidth: 500 }}>
              {lang === 'tj' && 'CompTJ - Мағозаи пешсафи компютерҳо ва лавозимот дар Тоҷикистон. Мо маҳсулоти баландсифатро бо кафолати расмӣ пешниҳод менамоем.'}
              {lang === 'ru' && 'CompTJ - Ведущий магазин компьютеров и аксессуаров в Таджикистане. Мы предлагаем качественную технику с официальной гарантией.'}
              {lang === 'en' && 'CompTJ - Leading computer and accessories store in Tajikistan. We offer high-quality hardware with official local warranty.'}
            </p>
          </div>
        </div>

        {/* Contact Links */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* WhatsApp Link */}
          <a
            href="https://wa.me/992900000000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.15rem', background: '#25D366', color: '#fff',
              borderRadius: 14, fontSize: '0.82rem', fontWeight: 700,
              textDecoration: 'none', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            WhatsApp
          </a>

          {/* Instagram Link */}
          <a
            href="https://instagram.com/comptj"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.15rem', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff',
              borderRadius: 14, fontSize: '0.82rem', fontWeight: 700,
              textDecoration: 'none', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Instagram
          </a>

          {/* Direct AI Chat trigger */}
          <button
            onClick={() => {
              const chatbotTrigger = document.querySelector('.ai-chat-trigger') as HTMLButtonElement;
              if (chatbotTrigger) {
                chatbotTrigger.click();
              }
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.15rem', background: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)', color: 'var(--text-primary)',
              borderRadius: 14, fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {lang === 'tj' ? 'Чат бо АИ' : lang === 'ru' ? 'Чат с ИИ' : 'Chat with AI'}
          </button>
        </div>
      </div>

      {/* Related laptops */}
      {related.length > 0 && (
        <section className="detail-related">
          <h2 className="detail-related-title">{t('relatedLaptops')}</h2>
          <div className="grid-layout">
            {related.map(l => (
              <LaptopCard key={l.id} laptop={l} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};
