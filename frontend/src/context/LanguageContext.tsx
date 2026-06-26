import React, { createContext, useContext, useState } from 'react';

export type Lang = 'tj' | 'ru' | 'en';

const T = {
  en: {
    home: 'Home', catalog: 'Catalog',
    searchPlaceholder: 'Search laptops by brand, model or CPU…',
    lightMode: 'Light Mode', darkMode: 'Dark Mode', profile: 'Profile',
    badge: 'Tajikistan Laptop Platform',
    heroTitle1: 'The best laptop', heroTitle2: 'at somoni price', heroTitle3: 'in Tajikistan',
    heroDesc: 'Somon Comp — global laptop marketplace in Tajikistan. Clear TJS pricing, official warranty, and fast delivery.',
    viewCatalog: 'View Catalog', learnMore: 'Learn More',
    weekOffer: '⭐ Week\'s Pick', available: 'Available', viewAll: 'View All →',
    modelsInStock: 'Models in stock', topBrands: 'Top brands', avgWarranty: 'Avg warranty', localCurrency: 'Local currency',
    popular: '🔥 Popular', topSales: 'Top Sales Laptops',
    whySomon: 'Why Somon Comp', lessProblems: 'Less hassle.', moreLaptops: 'More laptop.', allInOnePlace: 'Everything in one place and clear.',
    somoniPrice: 'Priced in Somoni', somoniPriceDesc: 'Clear TJS pricing, no hidden import fees. What you see is exactly what you pay.',
    officialWarranty: 'Official Warranty', officialWarrantyDesc: 'Every laptop ships with a manufacturer warranty honored right here in Tajikistan.',
    fastDelivery: 'Fast Delivery', fastDeliveryDesc: 'Same-week delivery across Dushanbe with reliable nationwide shipping on all orders.',
    laptopCatalog: 'Laptop', catalogSuffix: 'Catalog',
    found: 'found', laptopWord: 'laptop',
    priceInTJS: 'Price (TJS)', filtersLabel: 'Filters', brand: 'Brand', ram: 'RAM',
    resetFilters: '✕ Reset all filters', showFilters: 'Show Filters', hideFilters: 'Hide Filters', active: 'Active',
    noLaptopsFound: 'No laptops found', tryChangingFilters: 'Try changing your filters or search term.',
    inStock: 'in stock', outOfStock: 'Out of stock', buy: 'Buy Now', warranty: 'mo warranty',
    backToCatalog: '← Back to catalog', specifications: 'Specifications',
    processor: 'Processor', memory: 'Memory', storage: 'Storage', graphics: 'Graphics',
    warrantyLabel: 'Warranty', keyboardLayout: 'Keyboard',
    addToCart: 'Buy Now', outOfStockBtn: 'Out of Stock',
    descriptionLabel: 'Description', relatedLaptops: 'You might also like',
    guarantee: '✓ 12–24 month warranty', deliveryCity: '✓ Delivery in Dushanbe', modelsCount: '✓ 22+ models',
    notifTitle: 'Notifications',
    notif1Title: 'New laptops added!', notif1Desc: 'MSI Pulse 15 & MacBook Pro M3 now in stock',
    notif2Title: 'Price drop on Acer Aspire 3', notif2Desc: 'Now from 4,990 TJS',
    notif3Title: 'Free delivery in Dushanbe', notif3Desc: 'On all orders this week',
    months: 'mo', monthsFull: 'months',
  },
  ru: {
    home: 'Главная', catalog: 'Каталог',
    searchPlaceholder: 'Поиск ноутбуков по бренду, модели или процессору…',
    lightMode: 'Светлая тема', darkMode: 'Тёмная тема', profile: 'Профиль',
    badge: 'Ноутбучная платформа Таджикистана',
    heroTitle1: 'Лучший ноутбук', heroTitle2: 'по цене в сомони', heroTitle3: 'в Таджикистане',
    heroDesc: 'Somon Comp — мировой рынок ноутбуков в Таджикистане. Чёткие цены в TJS, официальная гарантия и быстрая доставка.',
    viewCatalog: 'Смотреть каталог', learnMore: 'Узнать больше',
    weekOffer: '⭐ Выбор недели', available: 'В наличии', viewAll: 'Смотреть все →',
    modelsInStock: 'Моделей в наличии', topBrands: 'Топ брендов', avgWarranty: 'Средняя гарантия', localCurrency: 'Местная валюта',
    popular: '🔥 Популярное', topSales: 'Топ продаж ноутбуков',
    whySomon: 'Почему Somon Comp', lessProblems: 'Меньше проблем.', moreLaptops: 'Больше ноутбуков.', allInOnePlace: 'Всё в одном месте и понятно.',
    somoniPrice: 'Цены в сомони', somoniPriceDesc: 'Чёткие цены в TJS без скрытых ввозных сборов. Что видите — то и платите.',
    officialWarranty: 'Официальная гарантия', officialWarrantyDesc: 'Каждый ноутбук поставляется с гарантией производителя, действующей в Таджикистане.',
    fastDelivery: 'Быстрая доставка', fastDeliveryDesc: 'Доставка по Душанбе за одну неделю и надёжная доставка по всей стране.',
    laptopCatalog: 'Каталог', catalogSuffix: 'ноутбуков',
    found: 'найдено', laptopWord: 'ноутбук',
    priceInTJS: 'Цена (TJS)', filtersLabel: 'Фильтры', brand: 'Бренд', ram: 'Оперативная память',
    resetFilters: '✕ Сбросить все фильтры', showFilters: 'Показать фильтры', hideFilters: 'Скрыть фильтры', active: 'Активен',
    noLaptopsFound: 'Ноутбуки не найдены', tryChangingFilters: 'Попробуйте изменить фильтры или поисковый запрос.',
    inStock: 'в наличии', outOfStock: 'Нет в наличии', buy: 'Купить', warranty: 'мес. гарантия',
    backToCatalog: '← Назад в каталог', specifications: 'Характеристики',
    processor: 'Процессор', memory: 'Оперативная память', storage: 'Накопитель', graphics: 'Видеокарта',
    warrantyLabel: 'Гарантия', keyboardLayout: 'Клавиатура',
    addToCart: 'Купить', outOfStockBtn: 'Нет в наличии',
    descriptionLabel: 'Описание', relatedLaptops: 'Вам также может понравиться',
    guarantee: '✓ Гарантия 12–24 месяца', deliveryCity: '✓ Доставка по Душанбе', modelsCount: '✓ 22+ модели',
    notifTitle: 'Уведомления',
    notif1Title: 'Добавлены новые ноутбуки!', notif1Desc: 'MSI Pulse 15 и MacBook Pro M3 теперь в наличии',
    notif2Title: 'Снижение цены на Acer Aspire 3', notif2Desc: 'Теперь от 4 990 TJS',
    notif3Title: 'Бесплатная доставка по Душанбе', notif3Desc: 'На все заказы на этой неделе',
    months: 'мес', monthsFull: 'месяцев',
  },
  tj: {
    home: 'Хона', catalog: 'Каталог',
    searchPlaceholder: 'Ҷустуҷӯ бо бренд, модел ё CPU…',
    lightMode: 'Равшан', darkMode: 'Торик', profile: 'Профил',
    badge: 'Платформаи лаптопии Тоҷикистон',
    heroTitle1: 'Лаптопи беҳтарин', heroTitle2: 'бо нархи сомонӣ', heroTitle3: 'дар Тоҷикистон',
    heroDesc: 'Somon Comp — бозори лаптопҳои ҷаҳонӣ дар Тоҷикистон. Нархи аниқ бо сомонӣ, кафолати расмӣ, ва таҳвили зуд.',
    viewCatalog: 'Каталогро бин', learnMore: 'Бештар бидон',
    weekOffer: '⭐ Пешниҳоди ҳафта', available: 'Дастрас', viewAll: 'Ҳамаро бин →',
    modelsInStock: 'Модел дар анбор', topBrands: 'Брендҳои беҳтарин', avgWarranty: 'Кафолати миёна', localCurrency: 'Асъори маҳаллӣ',
    popular: '🔥 Маъмул', topSales: 'Лаптопҳои Top Sales',
    whySomon: 'Чаро Somon Comp', lessProblems: 'Камтар мушкил.', moreLaptops: 'Бештар лаптоп.', allInOnePlace: 'Ҳама чиз дар як ҷой ва равшан.',
    somoniPrice: 'Нархи сомонӣ', somoniPriceDesc: 'Нархи равшан бо сомонӣ, бидуни ягон хароҷоти пинҳонии воридотӣ.',
    officialWarranty: 'Кафолати расмӣ', officialWarrantyDesc: 'Ҳар лаптоп бо кафолати истеҳсолкунанда дар Тоҷикистон интиқол меёбад.',
    fastDelivery: 'Таҳвили зуд', fastDeliveryDesc: 'Таҳвили ҳафтаӣ дар Душанбе ва фиристодани боэтимод ба саросари кишвар.',
    laptopCatalog: 'Каталоги', catalogSuffix: 'лаптопҳо',
    found: 'ёфт шуд', laptopWord: 'лаптоп',
    priceInTJS: 'Нарх (TJS)', filtersLabel: 'Фильтрҳо', brand: 'Бренд', ram: 'RAM',
    resetFilters: '✕ Ҳамаи фильтрҳоро тоза кун', showFilters: 'Фильтрҳоро нишон деҳ', hideFilters: 'Фильтрҳоро пинҳон кун', active: 'Фаъол',
    noLaptopsFound: 'Лаптоп ёфт нашуд', tryChangingFilters: 'Фильтр ё калимаи ҷустуҷӯро тағйир диҳед.',
    inStock: 'дастрас', outOfStock: 'Тамом шуд', buy: 'Харидан', warranty: 'мо кафолат',
    backToCatalog: '← Ба каталог', specifications: 'Хусусиятҳо',
    processor: 'Протсессор', memory: 'Хотира', storage: 'Нигаҳдорӣ', graphics: 'Графика',
    warrantyLabel: 'Кафолат', keyboardLayout: 'Клавиатура',
    addToCart: 'Харидан', outOfStockBtn: 'Тамом шуд',
    descriptionLabel: 'Тавсиф', relatedLaptops: 'Инчунин мумкин аст хуш оед',
    guarantee: '✓ Кафолат 12–24 моҳ', deliveryCity: '✓ Таҳвил дар Душанбе', modelsCount: '✓ 22+ модел',
    notifTitle: 'Огоҳиномаҳо',
    notif1Title: 'Лаптопҳои нав илова шуданд!', notif1Desc: 'MSI Pulse 15 ва MacBook Pro M3 акнун дастрасанд',
    notif2Title: 'Нархи Acer Aspire 3 кам шуд', notif2Desc: 'Акнун аз 4,990 TJS',
    notif3Title: 'Таҳвили ройгон дар Душанбе', notif3Desc: 'Барои ҳамаи фармоишҳои ин ҳафта',
    months: 'мо', monthsFull: 'моҳ',
  },
} as const;

export type TranslationKeys = keyof typeof T['en'];
type Translations = typeof T;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKeys) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'tj',
  setLang: () => {},
  t: (k) => k,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem('sc-lang') as Lang;
      return s && ['tj','ru','en'].includes(s) ? s : 'tj';
    } catch { return 'tj'; }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('sc-lang', l);
  };

  const t = (key: TranslationKeys): string =>
    (T[lang] as Translations[Lang])[key] as string;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
