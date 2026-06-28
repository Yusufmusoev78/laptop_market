import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Truck, ShieldCheck, Coins, ArrowRight, Check, Star, Flame, Laptop as LaptopIcon, Monitor, Apple, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LaptopCard } from '../components/ui/LaptopCard';
import { PhoneCard } from '../components/ui/PhoneCard';
import { getLaptops, Laptop } from '../api/laptops';
import { getPhones, Phone } from '../api/phones';
import { useLang } from '../context/LanguageContext';
import { useMarket } from '../context/MarketContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { marketMode } = useMarket();
  const [hotItems, setHotItems] = useState<(Laptop | Phone)[]>([]);

  const FEATURES = [
    { icon: Coins,       titleKey: 'somoniPrice' as const,    descKey: 'somoniPriceDesc' as const },
    { icon: ShieldCheck, titleKey: 'officialWarranty' as const, descKey: 'officialWarrantyDesc' as const },
    { icon: Truck,       titleKey: 'fastDelivery' as const,   descKey: 'fastDeliveryDesc' as const },
  ];

  const STATS = [
    { number: marketMode === 'laptop' ? '22+' : '15+',  labelKey: 'modelsInStock' as const },
    { number: marketMode === 'laptop' ? '9' : '3',    labelKey: 'topBrands' as const },
    { number: '12mo', labelKey: 'avgWarranty' as const },
    { number: 'TJS',  labelKey: 'localCurrency' as const },
  ];

  useEffect(() => {
    if (marketMode === 'laptop') {
      getLaptops().then(all => {
        const sorted = [...all].sort((a, b) => b.price_tjs - a.price_tjs);
        setHotItems(sorted.slice(0, 4));
      }).catch(() => {});
    } else {
      getPhones().then(all => {
        const sorted = [...all].sort((a, b) => b.price_tjs - a.price_tjs);
        setHotItems(sorted.slice(0, 4));
      }).catch(() => {});
    }
  }, [marketMode]);

  const scrollToFeatures = () =>
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });

  const FeaturedIcon = marketMode === 'laptop' ? LaptopIcon : Smartphone;

  return (
    <div className="animate-fade-in">

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', margin: '0 -1.5rem' }}>
        <div className="hero-bg">
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: marketMode === 'laptop' ? 'url(/luxury_laptop_bg.png)' : 'url(/luxury_phone_bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.16,
            mixBlendMode: 'luminosity'
          }} />
          <div className="hero-grid-overlay" />
        </div>

        <div className="hero-inner">
          {/* Left */}
          <div className="hero-text">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              <span>
                {marketMode === 'laptop' ? t('badge') : (lang === 'tj' ? 'Платформаи телефонии Тоҷикистон' : lang === 'ru' ? 'Телефонная платформа Таджикистана' : 'Tajikistan Smartphone Platform')}
              </span>
            </div>

            <h1 className="hero-h1">
              {marketMode === 'laptop' ? (
                <>
                  {t('heroTitle1')}<br />
                  <span className="text-gradient">{t('heroTitle2')}</span><br />
                  {t('heroTitle3')}
                </>
              ) : (
                <>
                  {lang === 'tj' ? 'Телефони беҳтарин' : lang === 'ru' ? 'Лучший телефон' : 'The best phone'}<br />
                  <span className="text-gradient">{t('heroTitle2')}</span><br />
                  {t('heroTitle3')}
                </>
              )}
            </h1>

            <p className="hero-desc">
              {marketMode === 'laptop' ? t('heroDesc') : (
                lang === 'tj' ? 'Somon Comp — бозори телефонҳои мобилӣ дар Тоҷикистон. Нархҳои дастрас, кафолати расмӣ ва таҳвили фаврӣ.' :
                lang === 'ru' ? 'Somon Comp — глобальный рынок мобильных телефонов в Таджикистане. Доступные цены, официальная гарантия и быстрая доставка.' :
                'Somon Comp — global mobile marketplace in Tajikistan. Fair TJS pricing, official brand warranties, and speedy delivery.'
              )}
            </p>

            <div className="hero-cta">
              <Button size="lg" variant="primary" onClick={() => navigate('/catalog')}>
                {t('viewCatalog')} <ArrowRight size={17} />
              </Button>
              <Button size="lg" variant="glass" onClick={scrollToFeatures}>
                {t('learnMore')}
              </Button>
            </div>

            <div className="hero-badges">
              <span className="hero-badge"><Check size={12} style={{ marginRight: '4px', verticalAlign: 'middle', color: 'var(--primary)' }} />{t('guarantee')}</span>
              <span className="hero-badge"><Check size={12} style={{ marginRight: '4px', verticalAlign: 'middle', color: 'var(--primary)' }} />{t('deliveryCity')}</span>
              <span className="hero-badge"><Check size={12} style={{ marginRight: '4px', verticalAlign: 'middle', color: 'var(--primary)' }} />{marketMode === 'laptop' ? '22+ models' : '15+ models'}</span>
            </div>
          </div>

          {/* Right — decorative card */}
          <div className="hero-card-wrap">
            <div className="hero-featured-card">
              <div className="hero-card-header">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Star size={13} style={{ fill: 'currentColor' }} />
                  {t('weekOffer')}
                </span>
                <span className="hero-card-badge">{t('available')}</span>
              </div>
              <div className="hero-card-image">
                <div className="hero-card-orb" />
                <FeaturedIcon size={64} style={{ color: 'var(--primary)', position: 'relative', zIndex: 1 }} />
                <div className="hero-card-scan" />
              </div>
              <div className="hero-card-body">
                <p className="hero-card-name">
                  {marketMode === 'laptop' ? 'ASUS ROG Strix G16' : 'iPhone 15 Pro Max'}
                </p>
                <div className="hero-card-specs">
                  {(marketMode === 'laptop' ? ['i7-13650HX','32 GB','RTX 4060'] : ['A17 Pro','8 GB','Titanium']).map((v) => (
                    <span key={v} className="hero-spec-chip">{v}</span>
                  ))}
                </div>
                <div className="hero-card-footer">
                  <div>
                    <div className="hero-card-currency">TJS</div>
                    <div className="hero-card-price">
                      {marketMode === 'laptop' ? '21,990' : '16,500'}
                    </div>
                  </div>
                  <button className="hero-card-btn" onClick={() => navigate('/catalog')}>
                    {t('viewCatalog')} →
                  </button>
                </div>
              </div>
            </div>

            <div className="hero-mini-cards">
              {marketMode === 'laptop' ? (
                [
                  { icon: Monitor, n: 'Dell XPS 13',     p: '15,990' },
                  { icon: Apple, n: 'MacBook Pro M3', p: '27,900' },
                ].map(c => {
                  const IconComp = c.icon;
                  return (
                    <div key={c.n} className="hero-mini-card" onClick={() => navigate('/catalog')}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem' }}>
                        <IconComp size={22} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="hero-mini-name">{c.n}</div>
                      <div className="hero-mini-price">{c.p}</div>
                    </div>
                  );
                })
              ) : (
                [
                  { icon: Smartphone, n: 'S24 Ultra',     p: '15,900' },
                  { icon: Apple, n: 'iPhone 13', p: '8,200' },
                ].map(c => {
                  const IconComp = c.icon;
                  return (
                    <div key={c.n} className="hero-mini-card" onClick={() => navigate('/catalog')}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem' }}>
                        <IconComp size={22} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="hero-mini-name">{c.n}</div>
                      <div className="hero-mini-price">{c.p}</div>
                    </div>
                  );
                })
              )}
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
      {hotItems.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <p className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Flame size={12} />
            {t('popular')}
          </p>
          <div className="section-header">
            <h2>{marketMode === 'laptop' ? t('topSales') : t('topSalesPhones')}</h2>
            <NavLink to="/catalog">{t('viewAll')}</NavLink>
          </div>
          <div className="hot-grid">
            {hotItems.map(item => (
              marketMode === 'laptop' ? (
                <LaptopCard key={item.id} laptop={item as Laptop} isHot />
              ) : (
                <PhoneCard key={item.id} phone={item as Phone} isHot />
              )
            ))}
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section id="features" style={{ padding: '0.5rem 0 2rem' }}>
        <p className="section-eyebrow">{t('whySomon')}</p>
        <div style={{ marginBottom: '1.75rem' }}>
          <h2>
            {t('lessProblems')}{' '}
            <span className="text-gradient">
              {marketMode === 'laptop' ? t('moreLaptops') : (lang === 'tj' ? 'Бештар телефон.' : lang === 'ru' ? 'Больше телефонов.' : 'More phone.')}
            </span>
          </h2>
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
