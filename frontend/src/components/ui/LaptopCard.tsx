import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, isHot }) => {
  const navigate = useNavigate();
  const { t } = useLang();
  const inStock = laptop.stock_quantity > 0;
  const [imgError, setImgError] = useState(false);
  const imgSrc = getLaptopImageThumb(laptop.brand, laptop.model_name);

  const goToDetail = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.card-buy-btn')) return;
    navigate(`/catalog/${laptop.id}`);
  };

  return (
    <div className="laptop-card" onClick={goToDetail} style={{ cursor: 'pointer' }}>
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
    </div>
  );
};
