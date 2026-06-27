import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, MemoryStick, Zap, ShieldCheck, Keyboard, ShoppingCart, ArrowLeft, Package } from 'lucide-react';
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
  const { t } = useLang();

  const [laptop,   setLaptop]   = useState<Laptop | null>(null);
  const [related,  setRelated]  = useState<Laptop[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [broken,   setBroken]   = useState<Set<number>>(new Set());

  useEffect(() => {
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
                <span style={{ fontSize: '5rem' }}>💻</span>
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
              <span className="detail-currency">TJS</span>
              <span className="detail-amount">{fmt(laptop.price_tjs)}</span>
            </div>
            <div className="detail-trust">
              <span>✓ {laptop.warranty_months} {t('monthsFull')} {t('warrantyLabel')}</span>
              <span>{t('deliveryCity')}</span>
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
