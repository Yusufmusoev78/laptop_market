import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Cpu, HardDrive, MemoryStick, Zap, ShoppingCart } from 'lucide-react';
import { Laptop as LaptopType } from '../../api/laptops';
import { getLaptopImageThumb } from '../../utils/laptopImages';
import { useLang } from '../../context/LanguageContext';
import './LaptopCard.css';

interface LaptopCardProps {
  laptop: LaptopType;
  isHot?: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

const TILT_MAX_DEG = 6;

export const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, isHot }) => {
  const navigate = useNavigate();
  const { t } = useLang();
  const inStock = laptop.stock_quantity > 0;
  const [imgError, setImgError] = useState(false);
  const imgSrc = getLaptopImageThumb(laptop.brand, laptop.model_name);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleMouseLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  const goToDetail = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.card-buy-btn')) return;
    navigate(`/catalog/${laptop.id}`);
  };

  return (
    <motion.div
      ref={cardRef}
      className="laptop-card"
      onClick={goToDetail}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer', rotateX, rotateY, transformPerspective: 800 }}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
    >
      {/* ── Image area ── */}
      <div className="card-image-area">
        <span className="laptop-brand-badge">{laptop.brand}</span>

        {isHot && <span className="hot-badge">🔥 HOT</span>}

        <div className={`stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
          {inStock ? `${laptop.stock_quantity} ${t('inStock')}` : t('outOfStock')}
        </div>

        {!imgError ? (
          <img
            src={imgSrc}
            alt={`${laptop.brand} ${laptop.model_name}`}
            className="card-photo"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="card-photo-fallback">💻</div>
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
