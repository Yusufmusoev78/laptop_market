import React from 'react';
import { NavLink } from 'react-router-dom';
import { Gem, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { useMarket } from '../../context/MarketContext';
import { useAuth } from '../../context/AuthContext';

const TEXTS = {
  en: {
    description: "Somon Comp — Tajikistan's premier online marketplace for high-performance laptops and smartphones. Enjoy fair somoni pricing, official brand warranties, and fast delivery.",
    quickLinks: "Quick Links",
    markets: "Explore Markets",
    contactUs: "Contact Us",
    dushanbe: "Rudaki Ave, Dushanbe, Tajikistan",
    rights: "All rights reserved.",
    laptopsLink: "Laptops & Computers",
    phonesLink: "Smartphones & Mobiles",
    financing: "Zero-markup installment financing through Alif, Humo, and Eskhata.",
    home: "Home",
    catalog: "Catalog",
    profile: "Profile",
    admin: "Admin Panel"
  },
  ru: {
    description: "Somon Comp — ведущий маркетплейс ноутбуков и смартфонов в Таджикистане. Доступные цены в сомони, официальная гарантия и быстрая доставка.",
    quickLinks: "Быстрые ссылки",
    markets: "Категории товаров",
    contactUs: "Контакты",
    dushanbe: "пр. Рудаки, Душанбе, Таджикистан",
    rights: "Все права защищены.",
    laptopsLink: "Ноутбуки и ПК",
    phonesLink: "Смартфоны и гаджеты",
    financing: "Беспроцентная рассрочка через партнеров Алиф, Хумо и Эсхата.",
    home: "Главная",
    catalog: "Каталог",
    profile: "Профиль",
    admin: "Панель администратора"
  },
  tj: {
    description: "Somon Comp — бозори муосири лаптопҳо ва смартфонҳо дар Тоҷикистон. Нархҳои дастрас бо сомонӣ, кафолати расмӣ ва таҳвили зуд.",
    quickLinks: "Пайвандҳои муфид",
    markets: "Категорияҳо",
    contactUs: "Тамос",
    dushanbe: "х. Рудакӣ, Душанбе, Тоҷикистон",
    rights: "Ҳамаи ҳуқуқҳо ҳифз шудаанд.",
    laptopsLink: "Лаптопҳо ва компютерҳо",
    phonesLink: "Телефонҳо ва смартфонҳо",
    financing: "Қарзи қисм-қисм бидуни изофапулӣ тавассути Алиф, Хумо ва Эсхата.",
    home: "Хона",
    catalog: "Каталог",
    profile: "Профил",
    admin: "Панели маъмур"
  }
};

export const Footer: React.FC = () => {
  const { lang } = useLang();
  const { setMarketMode } = useMarket();
  const { user } = useAuth();
  
  const text = TEXTS[lang] || TEXTS.en;

  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        {/* Column 1: Brand Info */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <Gem size={20} style={{ color: 'var(--accent)' }} />
            <span>Somon Comp</span>
          </div>
          <p className="footer-desc-text">
            {text.description}
          </p>
          <div className="footer-socials">
            <a href="https://t.me" target="_blank" rel="noreferrer" className="social-icon-btn" title="Telegram">
              <Send size={15} />
            </a>
            <a href="mailto:support@somoncomp.tj" className="social-icon-btn" title="Email Us">
              <Mail size={15} />
            </a>
            <a href="tel:+992900000000" className="social-icon-btn" title="Call Us">
              <Phone size={15} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">{text.quickLinks}</h4>
          <ul className="footer-links-list">
            <li>
              <NavLink to="/">{text.home}</NavLink>
            </li>
            <li>
              <NavLink to="/catalog">{text.catalog}</NavLink>
            </li>
            <li>
              <NavLink to="/profile">{text.profile}</NavLink>
            </li>
            {user?.is_admin && (
              <li>
                <NavLink to="/admin">{text.admin}</NavLink>
              </li>
            )}
          </ul>
        </div>

        {/* Column 3: Markets switcher shortcuts */}
        <div className="footer-col">
          <h4 className="footer-heading">{text.markets}</h4>
          <ul className="footer-links-list">
            <li>
              <NavLink to="/catalog" onClick={() => setMarketMode('laptop')}>
                💻 {text.laptopsLink}
              </NavLink>
            </li>
            <li>
              <NavLink to="/catalog" onClick={() => setMarketMode('phone')}>
                📱 {text.phonesLink}
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact & Partners */}
        <div className="footer-col">
          <h4 className="footer-heading">{text.contactUs}</h4>
          <ul className="footer-contact-details">
            <li>
              <MapPin size={14} style={{ color: 'var(--primary)' }} />
              <span>{text.dushanbe}</span>
            </li>
            <li>
              <Mail size={14} style={{ color: 'var(--primary)' }} />
              <a href="mailto:support@somoncomp.tj">support@somoncomp.tj</a>
            </li>
            <li>
              <Phone size={14} style={{ color: 'var(--primary)' }} />
              <a href="tel:+992900000000">+992 90 000 0000</a>
            </li>
          </ul>
          <p className="footer-financing-text">
            {text.financing}
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} Somon Comp. {text.rights}</p>
          <div className="footer-payment-badges">
            <span className="payment-badge">Alif</span>
            <span className="payment-badge">Humo</span>
            <span className="payment-badge">Eskhata</span>
            <span className="payment-badge">DC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
