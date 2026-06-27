import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Truck, ShieldCheck, Coins, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LaptopCard } from '../components/ui/LaptopCard';
import { Aurora } from '../components/ui/Aurora';
import { getLaptops, Laptop } from '../api/laptops';
import { useLang } from '../context/LanguageContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const [hotLaptops, setHotLaptops] = useState<Laptop[]>([]);

  const FEATURES = [
    { icon: Coins,       titleKey: 'somoniPrice' as const,    descKey: 'somoniPriceDesc' as const },
    { icon: ShieldCheck, titleKey: 'officialWarranty' as const, descKey: 'officialWarrantyDesc' as const },
    { icon: Truck,       titleKey: 'fastDelivery' as const,   descKey: 'fastDeliveryDesc' as const },
  ];

  const STATS = [
    { number: '22+',  labelKey: 'modelsInStock' as const },
    { number: '9',    labelKey: 'topBrands' as const },
    { number: '12mo', labelKey: 'avgWarranty' as const },
    { number: 'TJS',  labelKey: 'localCurrency' as const },
  ];

  useEffect(() => {
    getLaptops().then(all => {
      const sorted = [...all].sort((a, b) => b.price_tjs - a.price_tjs);
      setHotLaptops(sorted.slice(0, 4));
    }).catch(() => {});
  }, []);

  const scrollToFeatures = () =>
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="animate-fade-in">

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', margin: '0 -1.5rem' }}>
        <div className="hero-bg">
          <Aurora amplitude={1.1} colorStops={['#4338ca', '#6366f1', '#8b5cf6']} />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-orb hero-orb-4" />
          <div className="hero-grid-overlay" />
        </div>

        <div className="hero-inner">
          {/* Left */}
          <div className="hero-text">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              <span>{t('badge')}</span>
            </div>

            <h1 className="hero-h1">
              {t('heroTitle1')}<br />
              <span className="text-gradient">{t('heroTitle2')}</span><br />
              {t('heroTitle3')}
            </h1>

            <p className="hero-desc">{t('heroDesc')}</p>

            <div className="hero-cta">
              <Button size="lg" variant="primary" onClick={() => navigate('/catalog')}>
                {t('viewCatalog')} <ArrowRight size={17} />
              </Button>
              <Button size="lg" variant="glass" onClick={scrollToFeatures}>
                {t('learnMore')}
              </Button>
            </div>

            <div className="hero-badges">
              <span className="hero-badge">{t('guarantee')}</span>
              <span className="hero-badge">{t('deliveryCity')}</span>
              <span className="hero-badge">{t('modelsCount')}</span>
            </div>
          </div>

          {/* Right — decorative card */}
          <div className="hero-card-wrap">
            <div className="hero-featured-card">
              <div className="hero-card-header">
                <span>{t('weekOffer')}</span>
                <span className="hero-card-badge">{t('available')}</span>
              </div>
              <div className="hero-card-image">
                <div className="hero-card-orb" />
                <span style={{ fontSize: '4rem', position: 'relative', zIndex: 1 }}>💻</span>
                <div className="hero-card-scan" />
              </div>
              <div className="hero-card-body">
                <p className="hero-card-name">ASUS ROG Strix G16</p>
                <div className="hero-card-specs">
                  {[['CPU','i7-13650HX'],['RAM','32 GB'],['GPU','RTX 4060']].map(([,v]) => (
                    <span key={v} className="hero-spec-chip">{v}</span>
                  ))}
                </div>
                <div className="hero-card-footer">
                  <div>
                    <div className="hero-card-currency">TJS</div>
                    <div className="hero-card-price">21,990</div>
                  </div>
                  <button className="hero-card-btn" onClick={() => navigate('/catalog')}>
                    {t('viewCatalog')} →
                  </button>
                </div>
              </div>
            </div>

            <div className="hero-mini-cards">
              {[
                { e: '🖥️', n: 'Dell XPS 13',     p: '15,990' },
                { e: '🍎', n: 'MacBook Pro M3', p: '27,900' },
              ].map(c => (
                <div key={c.n} className="hero-mini-card" onClick={() => navigate('/catalog')}>
                  <div style={{ fontSize: '1.6rem' }}>{c.e}</div>
                  <div className="hero-mini-name">{c.n}</div>
                  <div className="hero-mini-price">{c.p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="stats-bar">
        {STATS.map(s => (
          <div key={s.labelKey} className="stat-item">
            <div className="stat-number">{s.number}</div>
            <div className="stat-label">{t(s.labelKey)}</div>
          </div>
        ))}
      </div>

      {/* ── Hot / Top Sales ── */}
      {hotLaptops.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <p className="section-eyebrow">{t('popular')}</p>
          <div className="section-header">
            <h2>{t('topSales')}</h2>
            <NavLink to="/catalog">{t('viewAll')}</NavLink>
          </div>
          <div className="hot-grid">
            {hotLaptops.map(l => (
              <LaptopCard key={l.id} laptop={l} isHot />
            ))}
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section id="features" style={{ padding: '0.5rem 0 2rem' }}>
        <p className="section-eyebrow">{t('whySomon')}</p>
        <div style={{ marginBottom: '1.75rem' }}>
          <h2>{t('lessProblems')} <span className="text-gradient">{t('moreLaptops')}</span></h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>{t('allInOnePlace')}</p>
        </div>

        <div className="grid-layout">
          {FEATURES.map(({ icon: Icon, titleKey, descKey }) => (
            <div key={titleKey} className="feature-card">
              <div className="feature-icon-wrap">
                <Icon size={22} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>{t(titleKey)}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{t(descKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
