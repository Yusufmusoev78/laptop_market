import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Cpu, HardDrive, MemoryStick, Zap, ShoppingCart, Image as ImageIcon, Laptop, Flame, Heart } from 'lucide-react';
import { Laptop as LaptopType } from '../../api/laptops';
import { getLaptopGallery } from '../../utils/laptopImages';
import { useLang } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import './LaptopCard.css';

interface LaptopCardProps {
  laptop: LaptopType;
  isHot?: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

const TILT_MAX_DEG = 6;
const CYCLE_MS = 850;

export const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, isHot }) => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const inStock = laptop.stock_quantity > 0;
  const cardRef = useRef<HTMLDivElement>(null);

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('liked-items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.laptops && parsed.laptops.includes(laptop.id)) {
          setIsLiked(true);
        }
      }
    } catch {}
  }, [laptop.id]);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('liked-items') || '{"laptops":[],"phones":[]}';
      const parsed = JSON.parse(saved);
      if (!parsed.laptops) parsed.laptops = [];
      let nextLiked = false;
      if (isLiked) {
        parsed.laptops = parsed.laptops.filter((id: number) => id !== laptop.id);
        toast.success(
          lang === 'en' ? 'Removed from favorites' :
          lang === 'ru' ? 'Удалено из избранного' :
          'Аз писандидаҳо нест карда шуд'
        );
      } else {
        parsed.laptops.push(laptop.id);
        nextLiked = true;
        toast.success(
          lang === 'en' ? 'Added to favorites' :
          lang === 'ru' ? 'Добавлено в избранное' :
          'Ба писандидаҳо илова карда шуд'
        );
      }
      setIsLiked(nextLiked);
      localStorage.setItem('liked-items', JSON.stringify(parsed));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const gallery = useMemo(
    () => getLaptopGallery(laptop.brand, laptop.model_name, 400),
    [laptop.brand, laptop.model_name],
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
    navigate(`/catalog/${laptop.id}`);
  };

  const allBroken = broken.size >= gallery.length;

  return (
    <motion.div
      ref={cardRef}
      className="laptop-card"
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
        {/* Fallback base layer (shows if every photo fails to load) */}
        <div className="card-photo-fallback">
          <Laptop size={44} style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Stacked gallery — only the active one is opaque */}
        {gallery.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${laptop.brand} ${laptop.model_name} — ${i + 1}`}
            className="card-photo"
            style={{ opacity: !broken.has(i) && i === active ? 1 : 0 }}
            onError={() => setBroken(prev => new Set(prev).add(i))}
            loading="lazy"
          />
        ))}

        <button
          type="button"
          onClick={toggleLike}
          className={`card-like-btn ${isLiked ? 'liked' : ''}`}
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            right: '0.75rem',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isLiked ? '#ef4444' : '#fff',
            transition: 'all 0.2s ease',
          }}
        >
          <Heart size={15} fill={isLiked ? '#ef4444' : 'none'} />
        </button>

        <span className="laptop-brand-badge">{laptop.brand}</span>

        {isHot && (
          <span className="hot-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Flame size={12} />
            HOT
          </span>
        )}

        <div className={`stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
          {inStock ? `${laptop.stock_quantity} ${t('inStock')}` : t('outOfStock')}
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
        <h3 className="laptop-title">{laptop.brand} {laptop.model_name}</h3>

        {laptop.description && (
          <p className="laptop-description">{laptop.description}</p>
        )}

        <div className="specs-row">
          <span className="spec-chip"><Cpu size={11} />{laptop.cpu}</span>
          <span className="spec-chip"><MemoryStick size={11} />{laptop.ram_gb} GB</span>
          <span className="spec-chip"><HardDrive size={11} />{laptop.storage_gb} GB</span>
          {laptop.gpu && <span className="spec-chip"><Zap size={11} />{laptop.gpu}</span>}
        </div>

        <div className="card-footer">
          <div className="price-tag">
            <span className="currency">TJS</span>
            <span className="amount">{fmt(laptop.price_tjs)}</span>
          </div>
          <span className="warranty-label">
            {laptop.warranty_months} {t('warranty')}
          </span>
        </div>

        <button
          className="card-buy-btn"
          disabled={!inStock}
          onClick={e => { e.stopPropagation(); if (inStock) navigate(`/catalog/${laptop.id}`); }}
        >
          <ShoppingCart size={15} />
          {inStock ? t('buy') : t('outOfStock')}
        </button>
      </div>
    </motion.div>
  );
};
