import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Gem, Search, Bell, Sun, Moon, User, X, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLang, Lang } from '../../context/LanguageContext';

const LANG_FLAGS: Record<Lang, string> = { tj: '🇹🇯', ru: '🇷🇺', en: '🇬🇧' };
const LANG_LABELS: Record<Lang, string> = { tj: 'TJ', ru: 'RU', en: 'EN' };

export const Navbar: React.FC = () => {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      setMobileOpen(false);
    }
  };

  return (
    <nav className="main-nav">
      {/* Brand */}
      <div className="nav-brand">
        <NavLink to="/" onClick={() => setMobileOpen(false)}>
          <Gem size={20} style={{ color: 'var(--primary)' }} />
          <span>
            <span className="nav-brand-text">Somon Comp</span>
            <span className="nav-brand-sub">Laptop Marketplace</span>
          </span>
        </NavLink>
      </div>

      {/* Center search */}
      <form className="nav-search" onSubmit={handleSearch}>
        <Search size={15} className="nav-search-icon" />
        <input
          ref={searchRef}
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
        />
        {searchVal && (
          <button type="button" className="nav-search-clear" onClick={() => setSearchVal('')}>
            <X size={13} />
          </button>
        )}
      </form>

      {/* Right */}
      <div className="nav-right">
        {/* Pill nav */}
        <div className="nav-pill-group desktop-only">
          <NavLink to="/" end>{t('home')}</NavLink>
          <NavLink to="/catalog">{t('catalog')}</NavLink>
        </div>

        <div className="nav-actions">
          {/* Language switcher */}
          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              className="nav-icon-btn lang-btn"
              onClick={() => { setLangOpen(o => !o); setNotifOpen(false); }}
              title="Language / Забон / Язык"
            >
              <span style={{ fontSize: '0.8rem' }}>{LANG_FLAGS[lang]}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{LANG_LABELS[lang]}</span>
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                {(['tj', 'ru', 'en'] as Lang[]).map(l => (
                  <button
                    key={l}
                    className={`lang-option ${lang === l ? 'active' : ''}`}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                  >
                    <span>{LANG_FLAGS[l]}</span>
                    <span>{l === 'tj' ? 'Тоҷикӣ' : l === 'ru' ? 'Русский' : 'English'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="nav-icon-btn"
              title={t('notifTitle')}
              onClick={() => { setNotifOpen(n => !n); setLangOpen(false); }}
            >
              <Bell size={17} />
              <span className="notif-dot" />
            </button>
            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span>{t('notifTitle')}</span>
                  <button onClick={() => setNotifOpen(false)}><X size={14} /></button>
                </div>
                <div className="notif-item">
                  <span className="notif-icon">🔥</span>
                  <div><p>{t('notif1Title')}</p><span>{t('notif1Desc')}</span></div>
                </div>
                <div className="notif-item">
                  <span className="notif-icon">💸</span>
                  <div><p>{t('notif2Title')}</p><span>{t('notif2Desc')}</span></div>
                </div>
                <div className="notif-item">
                  <span className="notif-icon">✅</span>
                  <div><p>{t('notif3Title')}</p><span>{t('notif3Desc')}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Theme */}
          <button className="nav-icon-btn" onClick={toggle} title={theme === 'dark' ? t('lightMode') : t('darkMode')}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Profile */}
          <button className="nav-icon-btn nav-profile-btn" title={t('profile')}>
            <User size={16} />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(m => !m)} aria-label="Menu">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              autoFocus
            />
          </form>

          <NavLink to="/" end onClick={() => setMobileOpen(false)}>{t('home')}</NavLink>
          <NavLink to="/catalog" onClick={() => setMobileOpen(false)}>{t('catalog')}</NavLink>

          <div className="mobile-menu-divider" />

          {/* Mobile lang */}
          <div style={{ display: 'flex', gap: '0.4rem', padding: '0 0.9rem' }}>
            {(['tj', 'ru', 'en'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => { setLang(l); }}
                style={{
                  flex: 1, padding: '0.5rem',
                  border: `1px solid ${lang === l ? 'var(--border-primary)' : 'var(--border)'}`,
                  borderRadius: 10, background: lang === l ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: lang === l ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                }}
              >
                {LANG_FLAGS[l]} {LANG_LABELS[l]}
              </button>
            ))}
          </div>

          <div className="mobile-menu-divider" />

          <button className="mobile-menu-action" onClick={toggle}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? t('lightMode') : t('darkMode')}
          </button>
          <button className="mobile-menu-action">
            <User size={16} />
            {t('profile')}
          </button>
        </div>
      )}
    </nav>
  );
};
