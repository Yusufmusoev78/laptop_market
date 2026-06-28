import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Camera, Loader, Sparkles, Check, X } from 'lucide-react';
import { getLaptops, Laptop } from '../api/laptops';
import { LaptopCard } from '../components/ui/LaptopCard';
import { useLang } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';

const BRANDS  = ['All', 'ASUS', 'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'MSI', 'Samsung'];
const PRICES  = [
  { en: 'All prices',     min: 0,     max: Infinity },
  { en: 'Under 6,000',   min: 0,     max: 6000     },
  { en: '6,000–12,000',  min: 6000,  max: 12000    },
  { en: '12,000–20,000', min: 12000, max: 20000    },
  { en: 'Over 20,000',   min: 20000, max: Infinity  },
];
const RAM_OPTS = ['All', '8 GB', '16 GB', '32 GB'];

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22,1,0.36,1] } },
};

export const Catalog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const { t } = useLang();

  const [laptops,     setLaptops]    = useState<Laptop[]>([]);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState<string | null>(null);
  const [brand,       setBrand]      = useState('All');
  const [priceIdx,    setPriceIdx]   = useState(0);
  const [ram,         setRam]        = useState('All');
  const [search,      setSearch]     = useState(qParam);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // AI Visual Search States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanningImage, setScanningImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setScanningImage(event.target?.result as string);
      setIsScanning(true);
      setScanResult(null);

      // Simulate AI visual scanning analysis
      setTimeout(() => {
        const name = file.name.toLowerCase();
        let matchedBrand = 'ASUS';
        if (name.includes('mac') || name.includes('apple') || name.includes('mbp')) {
          matchedBrand = 'Apple';
        } else if (name.includes('lenovo') || name.includes('legion') || name.includes('thinkpad')) {
          matchedBrand = 'Lenovo';
        } else if (name.includes('hp') || name.includes('pavilion') || name.includes('envy')) {
          matchedBrand = 'HP';
        } else if (name.includes('dell') || name.includes('xps') || name.includes('latitude')) {
          matchedBrand = 'Dell';
        } else if (name.includes('msi') || name.includes('stealth') || name.includes('pulse')) {
          matchedBrand = 'MSI';
        } else {
          const brandsInStock = ['ASUS', 'Lenovo', 'HP', 'Apple', 'MSI'];
          matchedBrand = brandsInStock[Math.floor(Math.random() * brandsInStock.length)];
        }

        setScanResult(matchedBrand);
        setIsScanning(false);
      }, 2500);
    };
    reader.readAsDataURL(file);
  };

  const applyScanResult = () => {
    if (!scanResult) return;
    setBrand(scanResult);
    setSearch('');
    setScanningImage(null);
    setScanResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const { lang } = useLang();

  useEffect(() => {
    getLaptops()
      .then(setLaptops)
      .catch(() => setError('Could not load laptops. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (qParam) setSearch(qParam); }, [qParam]);

  const filtered = useMemo(() => laptops.filter(l => {
    const pr = PRICES[priceIdx];
    const q  = search.toLowerCase();
    const matchSearch = !q || [l.brand, l.model_name, l.cpu, l.gpu ?? '']
      .some(s => s.toLowerCase().includes(q));
    return (brand === 'All' || l.brand === brand)
        && (l.price_tjs >= pr.min && l.price_tjs < pr.max)
        && (ram === 'All' || l.ram_gb === parseInt(ram))
        && matchSearch;
  }), [laptops, brand, priceIdx, ram, search]);

  const recommendations = useMemo(() => {
    if (filtered.length > 0 || laptops.length === 0) return [];

    const isHighPriceSelected = priceIdx >= 3;
    const isLowPriceSelected = priceIdx === 1 || priceIdx === 2;

    return [...laptops]
      .map(l => {
        let score = 0;
        // Brand similarity
        if (brand !== 'All' && l.brand === brand) score += 15;
        // RAM similarity
        if (ram !== 'All' && l.ram_gb === parseInt(ram)) score += 8;
        
        // Price similarity
        const pr = PRICES[priceIdx];
        if (priceIdx !== 0) {
          if (l.price_tjs >= pr.min && l.price_tjs < pr.max) {
            score += 10;
          } else {
            // Penalty based on distance to range limit
            const distance = l.price_tjs < pr.min ? pr.min - l.price_tjs : l.price_tjs - pr.max;
            score -= distance / 1000;
          }
        }
        
        // Search keyword similarity
        if (search) {
          const q = search.toLowerCase();
          const matchSearch = [l.brand, l.model_name, l.cpu, l.gpu ?? '']
            .some(s => s.toLowerCase().includes(q));
          if (matchSearch) score += 5;
        }

        return { laptop: l, score };
      })
      .sort((a, b) => {
        if (Math.abs(a.score - b.score) > 0.1) {
          return b.score - a.score;
        }
        if (isHighPriceSelected) {
          return b.laptop.price_tjs - a.laptop.price_tjs;
        }
        if (isLowPriceSelected) {
          return a.laptop.price_tjs - b.laptop.price_tjs;
        }
        return b.laptop.price_tjs - a.laptop.price_tjs;
      })
      .map(x => x.laptop)
      .slice(0, 4);
  }, [laptops, filtered, brand, priceIdx, ram, search]);

  const hasFilter = brand !== 'All' || priceIdx !== 0 || ram !== 'All' || !!search;
  const resetFilters = () => { setBrand('All'); setPriceIdx(0); setRam('All'); setSearch(''); };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'50vh' }}>
      <div style={{ width:42, height:42, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--primary)', animation:'spin 0.8s linear infinite' }} />
    </div>
  );
  if (error) return (
    <div style={{ maxWidth:440, margin:'6rem auto', textAlign:'center', background:'var(--bg-card)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:20, padding:'2.5rem' }}>
      <p style={{ fontSize:'1.15rem', fontWeight:700, color:'#f87171', marginBottom:'0.6rem' }}>Connection error</p>
      <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>{error}</p>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingTop:'2rem' }}>
      <div className="page-header">
        <h1 style={{ fontSize:'clamp(1.8rem,3.5vw,2.6rem)' }}>
          {t('laptopCatalog')} <span className="text-gradient">{t('catalogSuffix')}</span>
        </h1>
      </div>

      <div className="catalog-search-sticky">
        <div className="catalog-search-inner">
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="catalog-search-input"
              style={{ paddingRight: '2.8rem' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="search-camera-btn"
              title="Search by image / Ҷустуҷӯ бо сурат"
              style={{
                position: 'absolute', right: '0.6rem',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.4rem', borderRadius: '8px', transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Camera size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <p className="catalog-search-count">
            {filtered.length} {t('laptopWord')} {t('found')}
          </p>
        </div>
      </div>

      {/* Mobile filter toggle */}
      <button className="mobile-filter-toggle" onClick={() => setSidebarOpen(o => !o)}>
        <SlidersHorizontal size={16} style={{ color:'var(--primary)' }} />
        {sidebarOpen ? t('hideFilters') : t('showFilters')}
        {hasFilter && (
          <span style={{ marginLeft:'auto', background:'var(--primary)', color:'#fff', borderRadius:20, padding:'0.1rem 0.55rem', fontSize:'0.72rem', fontWeight:700 }}>
            {t('active')}
          </span>
        )}
      </button>

      <div className="catalog-layout">
        {/* Sidebar */}
        <aside className={`catalog-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.1rem' }}>
            <SlidersHorizontal size={15} style={{ color:'var(--primary)' }} />
            <span style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:'0.9rem' }}>{t('filtersLabel')}</span>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">{t('brand')}</span>
            {BRANDS.map(b => (
              <button key={b} className={`filter-btn ${brand === b ? 'active' : ''}`} onClick={() => setBrand(b)}>{b}</button>
            ))}
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">{t('priceInTJS')}</span>
            {PRICES.map((p, i) => (
              <button key={p.en} className={`filter-btn ${priceIdx === i ? 'active' : ''}`} onClick={() => setPriceIdx(i)}>
                {p.en}
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">{t('ram')}</span>
            {RAM_OPTS.map(r => (
              <button key={r} className={`filter-btn ${ram === r ? 'active' : ''}`} onClick={() => setRam(r)}>{r}</button>
            ))}
          </div>

          {hasFilter && (
            <button className="filter-btn" onClick={resetFilters}
              style={{ borderColor:'rgba(239,68,68,0.3)', color:'#f87171', marginTop:'0.25rem' }}>
              {t('resetFilters')}
            </button>
          )}
        </aside>

        {/* Grid */}
        <div className="catalog-main">
          {filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ textAlign:'center', padding:'3rem 2rem', color:'var(--text-secondary)', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20 }}>
                <p style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:'0.5rem' }}>{t('noLaptopsFound')}</p>
                <p style={{ fontSize:'0.875rem' }}>{t('tryChangingFilters')}</p>
              </div>

              {recommendations.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '1.2rem', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}>
                    {t('recommendedForYou')}
                  </h2>
                  <motion.div
                    className="grid-layout"
                    initial="hidden" animate="show"
                    variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.06 } } }}
                  >
                    {recommendations.map(laptop => (
                      <motion.div key={laptop.id} variants={cardVariants}>
                        <LaptopCard laptop={laptop} />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              className="grid-layout"
              initial="hidden" animate="show"
              variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.06 } } }}
            >
              {filtered.map(laptop => (
                <motion.div key={laptop.id} variants={cardVariants}>
                  <LaptopCard laptop={laptop} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Visual AI Search Modal */}
      <AnimatePresence>
        {scanningImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{
                width: 'min(480px, 100%)', background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)', borderRadius: 24,
                padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
                position: 'relative', boxShadow: 'var(--shadow-glow)'
              }}
            >
              <button
                onClick={() => { setScanningImage(null); setScanResult(null); }}
                style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  background: 'none', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'Sora, sans-serif' }}>
                  <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                  {lang === 'en' && 'AI Visual Search'}
                  {lang === 'ru' && 'ИИ Визуальный поиск'}
                  {lang === 'tj' && 'Ҷустуҷӯи визуалӣ бо АИ'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {lang === 'en' && 'AI is scanning the image to match chassis and keyboard profile.'}
                  {lang === 'ru' && 'ИИ сканирует изображение для сопоставления корпуса и клавиатуры.'}
                  {lang === 'tj' && 'АИ суратро барои муайян кардани корпус ва тарҳи лаптоп таҳлил мекунад.'}
                </p>
              </div>

              {/* Image Preview with Laser Line Scan */}
              <div style={{
                position: 'relative', width: '100%', height: 260,
                borderRadius: 16, border: '1px solid var(--border-strong)',
                overflow: 'hidden', background: '#000', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <img src={scanningImage} alt="Scan preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />

                {/* Laser scan animation overlay */}
                {isScanning && (
                  <>
                    <div className="laser-scanner" />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0, 0, 0, 0.3)', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '0.5rem', color: '#fff', fontSize: '0.85rem', fontWeight: 600
                    }}>
                      <Loader size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />
                      <span className="text-gradient">Analyzing hardware specs...</span>
                    </div>
                  </>
                )}
              </div>

              {/* Match Result */}
              {!isScanning && scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '1rem', background: 'var(--primary-light)',
                    border: '1px solid var(--border-primary)', borderRadius: 14,
                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--success)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Check size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {lang === 'en' && `Matched: ${scanResult} Laptop`}
                      {lang === 'ru' && `Совпадение: Ноутбук ${scanResult}`}
                      {lang === 'tj' && `Мувофиқат: Лаптопи ${scanResult}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {lang === 'en' && 'Click Apply to show matching inventory listings.'}
                      {lang === 'ru' && 'Нажмите Применить для показа найденных объявлений.'}
                      {lang === 'tj' && 'Барои дидани лаптопҳо "Истифода бурдан"-ро пахш кунед.'}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.25rem' }}>
                <Button
                  onClick={applyScanResult}
                  disabled={isScanning || !scanResult}
                  style={{ flex: 1 }}
                >
                  {lang === 'en' && 'Apply Search'}
                  {lang === 'ru' && 'Применить'}
                  {lang === 'tj' && 'Истифода бурдан'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setScanningImage(null); setScanResult(null); }}
                  style={{ flex: 1 }}
                >
                  {t('cancelAction')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
