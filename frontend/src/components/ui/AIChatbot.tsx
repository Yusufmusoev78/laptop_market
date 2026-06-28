import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader, Trash2, Menu, Brain, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLaptops, Laptop } from '../../api/laptops';
import { getLaptopGallery } from '../../utils/laptopImages';
import { getPhones, Phone } from '../../api/phones';
import { getPhoneGallery } from '../../utils/phoneImages';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  laptops?: Laptop[];
  phones?: Phone[];
}

export const AIChatbot: React.FC = () => {
  const { lang } = useLang();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);

  // Load chat history from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('somon-comp-chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    getLaptops().then(setLaptops).catch(() => {});
    getPhones().then(setPhones).catch(() => {});
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('somon-comp-chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Set default welcome message if history is empty
  useEffect(() => {
    if (messages.length === 0) {
      const name = isAuthenticated && user ? (user.username || user.email.split('@')[0]) : '';
      let welcome = '';
      if (lang === 'tj') {
        welcome = name 
          ? `Салом, ${name}! Ман ёвари АИ Somon Comp мебошам. Чӣ тавр метавонам ба шумо кумак кунам?` 
          : 'Салом! Ман ёвар-АИ Somon Comp мебошам. Чӣ тавр метавонам ба шумо дар интихоби лаптопи мувофиқ ё телефони дилхоҳ кумак кунам?';
      } else if (lang === 'ru') {
        welcome = name 
          ? `Привет, ${name}! Я ИИ-ассистент Somon Comp. Как я могу помочь вам сегодня?` 
          : 'Привет! Я ИИ-ассистент Somon Comp. Как я могу помочь вам выбрать подходящий ноутбук или телефон?';
      } else {
        welcome = name 
          ? `Hello, ${name}! I am Somon Comp AI. How can I help you today?` 
          : 'Hello! I am Somon Comp AI. How can I help you find the perfect laptop or smartphone today?';
      }
      setMessages([{ sender: 'ai', text: welcome }]);
    }
  }, [lang, messages.length, isAuthenticated, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const clearHistory = () => {
    try {
      localStorage.removeItem('somon-comp-chat');
    } catch {}
    const name = isAuthenticated && user ? (user.username || user.email.split('@')[0]) : '';
    let welcome = '';
    if (lang === 'tj') {
      welcome = name 
        ? `Салом, ${name}! Ман ёвари АИ Somon Comp мебошам. Чӣ тавр метавонам ба шумо кумак кунам?` 
        : 'Салом! Ман ёвар-АИ Somon Comp мебошам. Чӣ тавр метавонам ба шумо дар интихоби лаптопи мувофиқ ё телефони дилхоҳ кумак кунам?';
    } else if (lang === 'ru') {
      welcome = name 
        ? `Привет, ${name}! Я ИИ-ассистент Somon Comp. Как я могу помочь вам сегодня?` 
        : 'Привет! Я ИИ-ассистент Somon Comp. Как я могу помочь вам выбрать подходящий ноутбук или телефон?';
    } else {
      welcome = name 
        ? `Hello, ${name}! I am Somon Comp AI. How can I help you today?` 
        : 'Hello! I am Somon Comp AI. How can I help you find the perfect laptop or smartphone today?';
    }
    setMessages([{ sender: 'ai', text: welcome }]);
    setShowMenu(false);
  };

  const getBusinessInsights = () => {
    setIsTyping(true);
    setShowMenu(false);
    setTimeout(() => {
      let insight = '';
      if (lang === 'tj') {
        insight = `**Таҳлили Омори Фурӯш & Идеяҳо (AI Audit)**:
• **Харидорон**: Корбарони фаъол бештар моделҳои Lenovo, Apple ва смартфонҳои Samsung-ро харидорӣ намудаанд.
• **Қарздорҳо**: Фармоишҳои қисм-қисм тавассути Alif ва Humo сурат гирифтаанд, қарздории муддаташ гузашта ҳоло ошкор нашудааст.
• **Маслиҳати АИ**: Барои ҳавасмандгардонии харид, кафолати лаптопҳоро барои моделҳои аз 12,000 TJS боло ва телефонҳои аз 10,000 TJS боло то 24 моҳ зиёд кунед.`;
      } else if (lang === 'ru') {
        insight = `**Анализ Продаж & Идеи (ИИ Аудит)**:
• **Покупатели**: Активные пользователи чаще всего покупали ноутбуки Lenovo, Apple и смартфоны Samsung.
• **Задолженности**: Все рассрочки обрабатываются партнерами Alif и Humo, просроченных платежей нет.
• **Совет ИИ**: Увеличьте гарантию до 24 месяцев на премиум-модели ноутбуков дороже 12 000 TJS и телефонов дороже 10 000 TJS, чтобы поднять продажи на 15%.`;
      } else {
        insight = `**Sales Analytics & AI Insights**:
• **Buyers**: Active buyers are purchasing Lenovo/Apple laptops and Samsung smartphones.
• **Debtors**: All installment sales are handled by Alif and Humo; no overdue debt alerts are active.
• **AI Recommendation**: Try increasing the warranty duration to 24 months for high-end laptops (above 12,000 TJS) and phones (above 10,000 TJS) to drive higher checkout conversions.`;
      }
      setMessages(prev => [...prev, { sender: 'ai', text: insight }]);
      setIsTyping(false);
    }, 1000);
  };

  const getShoppingGuide = () => {
    setIsTyping(true);
    setShowMenu(false);
    setTimeout(() => {
      let guide = '';
      if (lang === 'tj') {
        guide = `Барои интихоби маҳсулот ба ман нависед. Масалан:
• *"Лаптопи арзон"* (моделҳои то 8000 TJS)
• *"Телефони хуб"* (смартфонҳо бо RAM 8 ГБ+)
• *"Барои бозӣ"* (лаптопҳои бозикунӣ бо RTX)
• *"iPhone 15"* (дидани моделҳои iPhone)`;
      } else if (lang === 'ru') {
        guide = `Чтобы выбрать товар, напишите мне. Например:
• *"Покажи дешевые"* (для просмотра моделей до 8000 TJS)
• *"Хороший телефон"* (смартфоны с ОЗУ от 8 ГБ)
• *"Ноутбук для игр"* (игровые модели с картой RTX)
• *"iPhone 15"* (поиск моделей iPhone)`;
      } else {
        guide = `To find the right product, write to me. For example:
• *"Budget laptops"* (to see models under 8,000 TJS)
• *"Best phone"* (smartphones with 8GB+ RAM)
• *"Gaming laptops"* (to see dedicated RTX graphics models)
• *"iPhone 15"* (to view iPhone models)`;
      }
      setMessages(prev => [...prev, { sender: 'ai', text: guide }]);
      setIsTyping(false);
    }, 800);
  };

  const generateAIResponse = (queryText: string, storeLaptops: Laptop[], storePhones: Phone[], currentLang: string): { text: string; laptops?: Laptop[]; phones?: Phone[] } => {
    const query = queryText.toLowerCase();

    // Check if query is specifically targeting phones
    const isPhoneQuery = query.includes('phone') || query.includes('телефон') || query.includes('мобил') || query.includes('смартфон') || query.includes('iphone') || query.includes('xiaomi') || query.includes('samsung s24') || query.includes('galaxy') || query.includes('айфон');

    // 1. Check direct phone model match
    const matchedPhones = storePhones.filter(p => 
      query.includes(p.model_name.toLowerCase()) || 
      (query.includes(p.brand.toLowerCase()) && query.includes(p.model_name.split(' ')[0].toLowerCase()))
    ).slice(0, 3);
    
    if (matchedPhones.length > 0) {
      if (currentLang === 'tj') return { text: `Ман телефонҳои мувофиқро пайдо кардам:`, phones: matchedPhones };
      if (currentLang === 'ru') return { text: `Я нашёл подходящие модели телефонов:`, phones: matchedPhones };
      return { text: `I found matching phone models:`, phones: matchedPhones };
    }

    // 2. Check direct laptop model match
    const matchedLaptops = storeLaptops.filter(l => 
      query.includes(l.model_name.toLowerCase()) || 
      (query.includes(l.brand.toLowerCase()) && query.includes(l.model_name.split(' ')[0].toLowerCase()))
    ).slice(0, 3);
    
    if (matchedLaptops.length > 0) {
      if (currentLang === 'tj') return { text: `Ман моделҳои мувофиқро пайдо кардам:`, laptops: matchedLaptops };
      if (currentLang === 'ru') return { text: `Я нашёл подходящие модели:`, laptops: matchedLaptops };
      return { text: `I found matching laptop models:`, laptops: matchedLaptops };
    }

    // 3. Cheap/Budget queries
    if (query.includes('budget') || query.includes('cheap') || query.includes('арзон') || query.includes('дешев')) {
      if (isPhoneQuery) {
        const cheapPhones = storePhones.filter(p => p.price_tjs <= 6000).slice(0, 3);
        if (cheapPhones.length > 0) {
          if (currentLang === 'tj') return { text: `Телефонҳои арзон ва муносиб (то 6,000 TJS) дар анбор:`, phones: cheapPhones };
          if (currentLang === 'ru') return { text: `Бюджетные и доступные смартфоны (до 6 000 TJS) в наличии:`, phones: cheapPhones };
          return { text: `Here are our budget-friendly smartphones (under 6,000 TJS) in stock:`, phones: cheapPhones };
        }
      } else {
        const cheap = storeLaptops.filter(l => l.price_tjs <= 8000).slice(0, 3);
        if (cheap.length > 0) {
          if (currentLang === 'tj') return { text: `Моделҳои арзон ва муносиб (то 8,000 TJS) дар анбор:`, laptops: cheap };
          if (currentLang === 'ru') return { text: `Бюджетные и доступные модели (до 8 000 TJS) в наличии:`, laptops: cheap };
          return { text: `Here are our budget-friendly laptops (under 8,000 TJS) in stock:`, laptops: cheap };
        }
      }
    }

    // 4. Gaming / Performance queries
    if (query.includes('game') || query.includes('gaming') || query.includes('бозӣ') || query.includes('игр') || query.includes('мощн') || query.includes('пурқувват') || query.includes('fast') || query.includes('тез')) {
      if (isPhoneQuery) {
        const premiumPhones = storePhones.filter(p => p.ram_gb >= 8).slice(0, 3);
        if (premiumPhones.length > 0) {
          if (currentLang === 'tj') return { text: `Телефонҳои пурқувват ва тезкор (RAM 8 ГБ+):`, phones: premiumPhones };
          if (currentLang === 'ru') return { text: `Мощные и производительные телефоны (ОЗУ 8 ГБ+):`, phones: premiumPhones };
          return { text: `Here are our high-performance smartphones (8GB+ RAM):`, phones: premiumPhones };
        }
      } else {
        const gaming = storeLaptops.filter(l => l.gpu && (l.gpu.toLowerCase().includes('nvidia') || l.gpu.toLowerCase().includes('rtx') || l.gpu.toLowerCase().includes('radeon'))).slice(0, 3);
        if (gaming.length > 0) {
          if (currentLang === 'tj') return { text: `Лаптопҳои бозикунии (Gaming) дастрас бо графикаи пурқувват:`, laptops: gaming };
          if (currentLang === 'ru') return { text: `Игровые ноутбуки с мощными видеокартами в наличии:`, laptops: gaming };
          return { text: `Here are our gaming laptops with dedicated graphics in stock:`, laptops: gaming };
        }
      }
    }

    // 5. Battery / Camera specifications
    if (query.includes('camera') || query.includes('камера') || query.includes('battery') || query.includes('батарея') || query.includes('акс')) {
      const bestBatteryPhones = [...storePhones].sort((a, b) => b.battery_capacity_mah - a.battery_capacity_mah).slice(0, 3);
      if (bestBatteryPhones.length > 0) {
        if (currentLang === 'tj') return { text: `Телефонҳо бо камераи сифати баланд ва батареяи калон:`, phones: bestBatteryPhones };
        if (currentLang === 'ru') return { text: `Смартфоны с отличной камерой и мощным аккумулятором:`, phones: bestBatteryPhones };
        return { text: `Here are our smartphones with great cameras and battery capacity:`, phones: bestBatteryPhones };
      }
    }

    // 6. Specific brand queries
    const phoneBrands = ['apple', 'samsung', 'xiaomi'];
    const laptopBrands = ['asus', 'lenovo', 'hp', 'dell', 'apple', 'acer', 'msi', 'samsung'];
    
    if (isPhoneQuery) {
      for (const b of phoneBrands) {
        if (query.includes(b)) {
          const matched = storePhones.filter(p => p.brand.toLowerCase() === b).slice(0, 3);
          if (matched.length > 0) {
            if (currentLang === 'tj') return { text: `Телефонҳои дастраси бренди **${b.toUpperCase()}**:`, phones: matched };
            if (currentLang === 'ru') return { text: `Доступные телефоны бренда **${b.toUpperCase()}**:`, phones: matched };
            return { text: `Available phones from **${b.toUpperCase()}**:`, phones: matched };
          }
        }
      }
    } else {
      for (const b of laptopBrands) {
        if (query.includes(b)) {
          const matched = storeLaptops.filter(l => l.brand.toLowerCase() === b).slice(0, 3);
          if (matched.length > 0) {
            if (currentLang === 'tj') return { text: `Лаптопҳои дастраси бренди **${b.toUpperCase()}**:`, laptops: matched };
            if (currentLang === 'ru') return { text: `Доступные модели бренда **${b.toUpperCase()}**:`, laptops: matched };
            return { text: `Available laptops from **${b.toUpperCase()}**:`, laptops: matched };
          }
        }
      }
    }

    if (currentLang === 'tj') {
      return { text: `Ман ёвари АИ ҳастам ва метавонам ба шумо дар интихоби лаптоп ё телефон кумак кунам. Шумо метавонед савол диҳед, масалан:\n\n• "Кадом телефонҳо батареяи калон доранд?"\n• "Ифони арзон нишон деҳ"\n• "Лаптопи бозикунӣ доред?"\n• "Телефонҳои Samsung"` };
    } else if (currentLang === 'ru') {
      return { text: `Я ИИ-ассистент и могу помочь вам подобрать ноутбук или телефон. Вы можете спросить меня:\n\n• "У каких телефонов большая батарея?"\n• "Покажи дешевые айфоны"\n• "Какие ноутбуки подходят для игр?"\n• "Есть ли в наличии Samsung?"` };
    }
    return { text: `I am an AI assistant and I can help you find the right laptop or phone. Try asking me:\n\n• "Which phones have the best battery?"\n• "Show me cheap iPhones"\n• "Recommend a gaming laptop"\n• "Do you have Samsung phones in stock?"` };
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = generateAIResponse(userMsg, laptops, phones, lang);
      setMessages(prev => [
        ...prev, 
        { sender: 'ai', text: aiReply.text, laptops: aiReply.laptops, phones: aiReply.phones }
      ]);
      setIsTyping(false);
    }, 800);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      let content = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} style={{ color: 'var(--primary)', fontWeight: 700 }}>{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }
      return <div key={i} style={{ minHeight: '1.2rem', marginBottom: '0.2rem' }}>{parts.length > 0 ? parts : content}</div>;
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999 }}>
      {/* Floating trigger button */}
      <motion.button
        className="ai-chat-trigger"
        onClick={() => { setIsOpen(!isOpen); setShowMenu(false); }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 54, height: 54, borderRadius: '50%',
          background: 'var(--gradient-brand)', color: '#fff',
          border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-glow)'
        }}
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </motion.button>

      {/* Chat drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 240 }}
            style={{
              position: 'absolute', bottom: '4.5rem', right: 0,
              width: 'min(360px, 90vw)', height: 460,
              background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
              borderRadius: 20, boxShadow: 'var(--shadow-glow)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
              background: 'var(--primary-light)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--gradient-brand)', color: '#fff'
              }}>
                <Sparkles size={14} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>Somon Comp AI</span>
                <span style={{ fontSize: '0.66rem', color: 'var(--primary)', fontWeight: 600 }}>Active helper</span>
              </div>

              {/* Action buttons (Menu & Close) */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  title="AI Menu / Менюи АИ"
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '0.2rem'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <Menu size={17} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '0.2rem'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Main Area: Chat Messages OR Quick Actions Menu */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
              <AnimatePresence mode="wait">
                {showMenu ? (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                  >
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      {lang === 'en' && 'AI Assistant Menu'}
                      {lang === 'ru' && 'Меню Ассистента'}
                      {lang === 'tj' && 'Менюи Ёвари АИ'}
                    </h4>

                    {isAuthenticated && user?.is_admin && (
                      <button
                        onClick={getBusinessInsights}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem',
                          background: 'var(--bg-surface)', border: '1px solid var(--border)',
                          borderRadius: 12, color: 'var(--text-primary)', textAlign: 'left',
                          fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <Brain size={16} style={{ color: 'var(--primary)' }} />
                        <span>
                          {lang === 'en' && 'AI Business & Sales Insights'}
                          {lang === 'ru' && 'ИИ Аналитика и Идеи'}
                          {lang === 'tj' && 'Таҳлили фурӯш ва Идеяҳои АИ'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={getShoppingGuide}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem',
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 12, color: 'var(--text-primary)', textAlign: 'left',
                        fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <BookOpen size={16} style={{ color: 'var(--primary)' }} />
                      <span>
                        {lang === 'en' && 'Shopping Assistant Guide'}
                        {lang === 'ru' && 'Гид по покупкам'}
                        {lang === 'tj' && 'Роҳнамои харид'}
                      </span>
                    </button>

                    <button
                      onClick={clearHistory}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem',
                        background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: 12, color: '#f87171', textAlign: 'left',
                        fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)'}
                    >
                      <Trash2 size={16} />
                      <span>
                        {lang === 'en' && 'Clear Chat History'}
                        {lang === 'ru' && 'Очистить историю'}
                        {lang === 'tj' && 'Тозакунии таърихи чат'}
                      </span>
                    </button>

                    <button
                      onClick={() => setShowMenu(false)}
                      style={{
                        marginTop: 'auto', padding: '0.6rem',
                        background: 'none', border: '1px solid var(--border-strong)',
                        borderRadius: 10, color: 'var(--text-secondary)', cursor: 'pointer',
                        fontSize: '0.8rem', fontWeight: 600
                      }}
                    >
                      {lang === 'en' && '← Back to Chat'}
                      {lang === 'ru' && '← Назад к чату'}
                      {lang === 'tj' && '← Бозгашт ба чат'}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                  >
                    {/* Chat Messages List */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {messages.map((m, i) => (
                        <div
                          key={i}
                          style={{
                            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}
                        >
                          <div
                            style={{
                              padding: '0.6rem 0.9rem',
                              borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                              background: m.sender === 'user' ? 'var(--primary-light)' : 'var(--bg-surface)',
                              border: `1px solid ${m.sender === 'user' ? 'var(--border-primary)' : 'var(--border)'}`,
                              color: 'var(--text-primary)',
                              fontSize: '0.82rem',
                              lineHeight: 1.45
                            }}
                          >
                            {formatText(m.text)}
                          </div>

                          {/* Render matched laptops as clickable visual cards in chat */}
                          {m.laptops && m.laptops.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.1rem' }}>
                              {m.laptops.map(laptop => {
                                const gallery = getLaptopGallery(laptop.brand, laptop.model_name, 100);
                                const thumbnail = gallery[0];
                                return (
                                  <div
                                    key={laptop.id}
                                    onClick={() => {
                                      setIsOpen(false);
                                      navigate(`/catalog/${laptop.id}`);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.6rem',
                                      padding: '0.4rem 0.6rem',
                                      background: 'var(--bg-surface)',
                                      border: '1px solid var(--border)',
                                      borderRadius: '12px',
                                      cursor: 'pointer',
                                      transition: 'all 0.18s ease-in-out',
                                    }}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={e => {
                                      e.currentTarget.style.borderColor = 'var(--border)';
                                      e.currentTarget.style.transform = 'none';
                                    }}
                                  >
                                    <div style={{
                                      width: 38, height: 38, borderRadius: 6,
                                      background: '#000', overflow: 'hidden', display: 'flex',
                                      alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                      {thumbnail ? (
                                        <img src={thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                          {laptop.brand.substring(0, 2).toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        💻 {laptop.brand} {laptop.model_name}
                                      </span>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                                        {laptop.price_tjs.toLocaleString()} TJS
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textDecoration: 'underline', flexShrink: 0, paddingRight: '0.2rem' }}>
                                      {lang === 'en' ? 'View' : lang === 'ru' ? 'Смотреть' : 'Дидан'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Render matched phones as clickable visual cards in chat */}
                          {m.phones && m.phones.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.1rem' }}>
                              {m.phones.map(phone => {
                                const gallery = getPhoneGallery(phone.brand, phone.model_name, 100);
                                const thumbnail = gallery[0];
                                return (
                                  <div
                                    key={phone.id}
                                    onClick={() => {
                                      setIsOpen(false);
                                      navigate(`/catalog/phone/${phone.id}`);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.6rem',
                                      padding: '0.4rem 0.6rem',
                                      background: 'var(--bg-surface)',
                                      border: '1px solid var(--border)',
                                      borderRadius: '12px',
                                      cursor: 'pointer',
                                      transition: 'all 0.18s ease-in-out',
                                    }}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={e => {
                                      e.currentTarget.style.borderColor = 'var(--border)';
                                      e.currentTarget.style.transform = 'none';
                                    }}
                                  >
                                    <div style={{
                                      width: 38, height: 38, borderRadius: 6,
                                      background: '#000', overflow: 'hidden', display: 'flex',
                                      alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                      {thumbnail ? (
                                        <img src={thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                          {phone.brand.substring(0, 2).toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        📱 {phone.brand} {phone.model_name}
                                      </span>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                                        {phone.price_tjs.toLocaleString()} TJS
                                      </span>
                                    </div>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textDecoration: 'underline', flexShrink: 0, paddingRight: '0.2rem' }}>
                                      {lang === 'en' ? 'View' : lang === 'ru' ? 'Смотреть' : 'Дидан'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                      {isTyping && (
                        <div style={{
                          alignSelf: 'flex-start',
                          padding: '0.6rem 0.9rem',
                          borderRadius: '16px 16px 16px 2px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          fontSize: '0.82rem', color: 'var(--text-muted)'
                        }}>
                          <Loader size={12} className="animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <div style={{ padding: '0.85rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                        style={{
                          flex: 1, padding: '0.55rem 0.85rem',
                          background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
                          borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.85rem',
                          outline: 'none', fontFamily: 'inherit'
                        }}
                      />
                      <button
                        onClick={handleSend}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 36, height: 36, borderRadius: 12,
                          background: 'var(--gradient-brand)', color: '#fff',
                          border: 'none', cursor: 'pointer'
                        }}
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
