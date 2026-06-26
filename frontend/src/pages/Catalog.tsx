import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { getLaptops, Laptop } from '../api/laptops';
import { LaptopCard } from '../components/ui/LaptopCard';
import { useLang } from '../context/LanguageContext';

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
        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1rem', flexWrap:'wrap', alignItems:'center' }}>
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            style={{
              flex:1, minWidth:200, padding:'0.6rem 1rem',
              background:'var(--bg-card)', border:'1px solid var(--border-strong)',
              borderRadius:12, color:'var(--text-primary)', fontSize:'0.9rem', fontFamily:'inherit', outline:'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          />
          <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', whiteSpace:'nowrap' }}>
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
            <div style={{ textAlign:'center', padding:'4rem 2rem', color:'var(--text-secondary)', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20 }}>
              <p style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:'0.5rem' }}>{t('noLaptopsFound')}</p>
              <p style={{ fontSize:'0.875rem' }}>{t('tryChangingFilters')}</p>
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
    </div>
  );
};
