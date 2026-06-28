import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Cpu, HardDrive, MemoryStick, ShoppingCart, Image as ImageIcon, Smartphone, Flame, Ruler, Battery, Palette } from 'lucide-react';
import { Phone as PhoneType } from '../../api/phones';
import { getPhoneGallery } from '../../utils/phoneImages';
import { useLang } from '../../context/LanguageContext';
import './PhoneCard.css';

interface PhoneCardProps {
  phone: PhoneType;
  isHot?: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

const TILT_MAX_DEG = 6;
const CYCLE_MS = 850;

export const PhoneCard: React.FC<PhoneCardProps> = ({ phone, isHot }) => {
  const navigate = useNavigate();
  const { t } = useLang();
  const inStock = phone.stock_quantity > 0;
  const cardRef = useRef<HTMLDivElement>(null);

  const gallery = useMemo(
    () => getPhoneGallery(phone.brand, phone.model_name, 400),
    [phone.brand, phone.model_name],
  );

  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState<Set<number>>(new Set());
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCycle = () => {
    if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
  };

  const startCycle = () => {
    if (gallery.length < 2 || cycleRef.current) return;
    cycleRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % gallery.length);
    }, CYCLE_MS);
  };

  useEffect(() => stopCycle, []);

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { damping: 20, stiffness: 200 });
  const rotateY = useSpring(rawRotateY, { damping: 20, stiffness: 200 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cx = px / rect.width - 0.5;
    const cy = py / rect.height - 0.5;
    rawRotateY.set(cx * TILT_MAX_DEG * 2);
    rawRotateX.set(-cy * TILT_MAX_DEG * 2);
    card.style.setProperty('--spot-x', `${px}px`);
    card.style.setProperty('--spot-y', `${py}px`);
  };

  const handleMouseEnter = () => startCycle();

  const handleMouseLeave = () => {
    stopCycle();
    setActive(0);
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  const goToDetail = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.card-buy-btn')) return;
    navigate(`/catalog/phone/${phone.id}`);
  };

  const allBroken = broken.size >= gallery.length;

  return (
    <motion.div
      ref={cardRef}
      className="phone-card"
      onClick={goToDetail}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer', rotateX, rotateY, transformPerspective: 800 }}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
    >
      {/* ── Image area ── */}
      <div className="card-image-area">
        {/* Fallback base layer */}
        <div className="card-photo-fallback">
          <Smartphone size={44} style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Stacked gallery */}
        {gallery.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${phone.brand} ${phone.model_name} — ${i + 1}`}
            className="card-photo"
            style={{ opacity: !broken.has(i) && i === active ? 1 : 0 }}
            onError={() => setBroken(prev => new Set(prev).add(i))}
            loading="lazy"
          />
        ))}

        <span className="phone-brand-badge">{phone.brand}</span>

        {isHot && (
          <span className="hot-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Flame size={12} />
            HOT
          </span>
        )}

        <div className={`stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
          {inStock ? `${phone.stock_quantity} ${t('inStock')}` : t('outOfStock')}
        </div>

        {/* Photo count badge */}
        {gallery.length > 1 && !allBroken && (
          <span className="card-photo-count">
            <ImageIcon size={12} />{gallery.length}
          </span>
        )}

        {/* Dot indicators */}
        {gallery.length > 1 && !allBroken && (
          <div className="card-photo-dots">
            {gallery.map((_, i) => (
              <span key={i} className={`card-photo-dot ${i === active ? 'active' : ''}`} />
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="card-content">
        <h3 className="phone-title">{phone.brand} {phone.model_name}</h3>

        {phone.description && (
          <p className="phone-description">{phone.description}</p>
        )}

        <div className="specs-row">
          <span className="spec-chip"><Cpu size={11} />{phone.cpu}</span>
          <span className="spec-chip"><MemoryStick size={11} />{phone.ram_gb} GB</span>
          <span className="spec-chip"><HardDrive size={11} />{phone.storage_gb} GB</span>
          <span className="spec-chip"><Ruler size={11} />{phone.screen_size_inches}"</span>
          <span className="spec-chip"><Battery size={11} />{phone.battery_capacity_mah} mAh</span>
          <span className="spec-chip"><Palette size={11} />{phone.color}</span>
        </div>

        <div className="card-footer">
          <div className="price-tag">
            <span className="currency">TJS</span>
            <span className="amount">{fmt(phone.price_tjs)}</span>
          </div>
          <span className="warranty-label">
            {phone.warranty_months} {t('warranty')}
          </span>
        </div>

        <button
          className="card-buy-btn"
          disabled={!inStock}
          onClick={e => { e.stopPropagation(); if (inStock) navigate(`/catalog/phone/${phone.id}`); }}
        >
          <ShoppingCart size={15} />
          {inStock ? t('buy') : t('outOfStock')}
        </button>
      </div>
    </motion.div>
  );
};
