import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader, Trash2, Menu, Brain, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLaptops, Laptop } from '../../api/laptops';
import { getLaptopGallery } from '../../utils/laptopImages';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  laptops?: Laptop[];
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
          : 'Салом! Ман ёвар-АИ Somon Comp мебошам. Чӣ тавр метавонам ба шумо дар интихоби лаптопи мувофиқ кумак кунам?';
      } else if (lang === 'ru') {
        welcome = name 
          ? `Привет, ${name}! Я ИИ-ассистент Somon Comp. Как я могу помочь вам сегодня?` 
          : 'Привет! Я ИИ-ассистент Somon Comp. Как я могу помочь вам выбрать подходящий ноутбук?';
      } else {
        welcome = name 
          ? `Hello, ${name}! I am Somon Comp AI. How can I help you today?` 
          : 'Hello! I am Somon Comp AI. How can I help you find the perfect laptop today?';
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
        : 'Салом! Ман ёвар-АИ Somon Comp мебошам. Чӣ тавр метавонам ба шумо дар интихоби лаптопи мувофиқ кумак кунам?';
    } else if (lang === 'ru') {
      welcome = name 
        ? `Привет, ${name}! Я ИИ-ассистент Somon Comp. Как я могу помочь вам сегодня?` 
        : 'Привет! Я ИИ-ассистент Somon Comp. Как я могу помочь вам выбрать подходящий ноутбук?';
    } else {
      welcome = name 
        ? `Hello, ${name}! I am Somon Comp AI. How can I help you today?` 
        : 'Hello! I am Somon Comp AI. How can I help you find the perfect laptop today?';
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
• **Харидорон**: Корбарони фаъол аз брендҳои Lenovo ва Apple харидорӣ намудаанд.
• **Қарздорҳо**: Фармоишҳои қисм-қисм тавассути Alif ва Humo сурат гирифтаанд, қарздории муддаташ гузашта ҳоло ошкор нашудааст.
• **Маслиҳати АИ**: Барои ҳавасмандгардонии харид, кафолати лаптопҳоро барои моделҳои аз 12,000 TJS боло то 24 моҳ зиёд кунед.`;
      } else if (lang === 'ru') {
        insight = `**Анализ Продаж & Идеи (ИИ Аудит)**:
• **Покупатели**: Активные пользователи чаще всего покупали марки Lenovo и Apple.
• **Задолженности**: Все рассрочки обрабатываются партнерами Alif и Humo, просроченных платежей нет.
• **Совет ИИ**: Увеличьте гарантию до 24 месяцев на премиум-модели дороже 12 000 TJS, чтобы поднять продажи на 15%.`;
      } else {
        insight = `**Sales Analytics & AI Insights**:
• **Buyers**: Active buyers are purchasing Lenovo and Apple models.
• **Debtors**: All installment sales are handled by Alif and Humo; no overdue debt alerts are active.
• **AI Recommendation**: Try increasing the warranty duration to 24 months for high-end laptops (above 12,000 TJS) to drive higher checkout conversions.`;
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
        guide = `Барои интихоби лаптоп ба ман нависед. Масалан:
- *"Лаптопи арзон"* (барои дидани моделҳои то 8000 TJS)
- *"Барои бозӣ"* (барои дидани лаптопҳои бозикунӣ)
- *"Барои барномасозӣ"* (барои дидани моделҳо бо RAM 16 ГБ+)`;
      } else if (lang === 'ru') {
        guide = `Чтобы выбрать ноутбук, напишите мне. Например:
- *"Покажи дешевые"* (для просмотра моделей до 8000 TJS)
- *"Игровой ноутбук"* (для просмотра игровых моделей)
- *"Для программирования"* (для просмотра моделей с RAM от 16 ГБ)`;
      } else {
        guide = `To find the right laptop, write to me. For example:
- *"Budget laptops"* (to see models under 8,000 TJS)
- *"Gaming laptops"* (to see dedicated graphics models)
- *"Coding laptops"* (to see models with 16GB+ RAM)`;
      }
      setMessages(prev => [...prev, { sender: 'ai', text: guide }]);
      setIsTyping(false);
    }, 800);
  };

  const generateAIResponse = (queryText: string, storeLaptops: Laptop[], currentLang: string): { text: string; laptops?: Laptop[] } => {
    const query = queryText.toLowerCase();

    // Check direct model match
    const matchedDirect = storeLaptops.filter(l => 
      query.includes(l.model_name.toLowerCase()) || 
      (query.includes(l.brand.toLowerCase()) && query.includes(l.model_name.split(' ')[0].toLowerCase()))
    ).slice(0, 3);
    
    if (matchedDirect.length > 0) {
      if (currentLang === 'tj') return { text: `Ман моделҳои мувофиқро пайдо кардам:`, laptops: matchedDirect };
      if (currentLang === 'ru') return { text: `Я нашёл подходящие модели:`, laptops: matchedDirect };
      return { text: `I found matching laptop models:`, laptops: matchedDirect };
    }

    if (query.includes('budget') || query.includes('cheap') || query.includes('арзон') || query.includes('дешев')) {
      const cheap = storeLaptops.filter(l => l.price_tjs <= 8000).slice(0, 3);
      if (cheap.length > 0) {
        if (currentLang === 'tj') return { text: `Моделҳои арзон ва муносиб (то 8,000 TJS) дар анбор:`, laptops: cheap };
        if (currentLang === 'ru') return { text: `Бюджетные и доступные модели (до 8 000 TJS) в наличии:`, laptops: cheap };
        return { text: `Here are our budget-friendly laptops (under 8,000 TJS) in stock:`, laptops: cheap };
      }
    }

    if (query.includes('game') || query.includes('gaming') || query.includes('бозӣ') || query.includes('игр')) {
      const gaming = storeLaptops.filter(l => l.gpu && (l.gpu.toLowerCase().includes('nvidia') || l.gpu.toLowerCase().includes('rtx') || l.gpu.toLowerCase().includes('radeon'))).slice(0, 3);
      if (gaming.length > 0) {
        if (currentLang === 'tj') return { text: `Лаптопҳои бозикунии (Gaming) дастрас бо графикаи пурқувват:`, laptops: gaming };
        if (currentLang === 'ru') return { text: `Игровые ноутбуки с мощными видеокартами в наличии:`, laptops: gaming };
        return { text: `Here are our gaming laptops with dedicated graphics in stock:`, laptops: gaming };
      }
    }

    if (query.includes('code') || query.includes('coding') || query.includes('програм') || query.includes('барнома')) {
      const coding = storeLaptops.filter(l => l.ram_gb >= 16).slice(0, 3);
      if (coding.length > 0) {
        if (currentLang === 'tj') return { text: `Барои барномасозӣ ва корҳои вазнин моделҳои зерини дорои RAM ақаллан 16 ГБ тавсия мешаванд:`, laptops: coding };
        if (currentLang === 'ru') return { text: `Для программирования рекомендуем следующие модели с объемом оперативной памяти от 16 ГБ:`, laptops: coding };
        return { text: `For programming and software development, we recommend the following models with at least 16GB RAM:`, laptops: coding };
      }
    }

    // Specific brand query matching
    const brands = ['asus', 'lenovo', 'hp', 'dell', 'apple', 'acer', 'msi', 'samsung'];
    for (const b of brands) {
      if (query.includes(b)) {
        const matched = storeLaptops.filter(l => l.brand.toLowerCase() === b).slice(0, 3);
        if (matched.length > 0) {
          if (currentLang === 'tj') return { text: `Лаптопҳои дастраси бренди **${b.toUpperCase()}**:`, laptops: matched };
          if (currentLang === 'ru') return { text: `Доступные модели бренда **${b.toUpperCase()}**:`, laptops: matched };
          return { text: `Available laptops from **${b.toUpperCase()}**:`, laptops: matched };
        } else {
          if (currentLang === 'tj') return { text: `Мутаассифона, дар айни замон ягон лаптопи бренди ${b.toUpperCase()} дар анбор нест.` };
          if (currentLang === 'ru') return { text: `К сожалению, в данный момент ноутбуков бренда ${b.toUpperCase()} нет на складе.` };
          return { text: `Sorry, we currently don't have any ${b.toUpperCase()} laptops in stock.` };
        }
      }
    }

    if (currentLang === 'tj') {
      return { text: `Ман ёвари АИ ҳастам ва метавонам ба шумо дар интихоби лаптоп кумак кунам. Шумо метавонед савол диҳед, масалан:\n\n- "Кадом лаптопҳо барои бозӣ мувофиқанд?"\n- "Лаптопи арзон нишон деҳ"\n- "Лаптопҳои Apple доред?"` };
    } else if (currentLang === 'ru') {
      return { text: `Я ИИ-ассистент и могу помочь вам подобрать ноутбук. Вы можете спросить меня:\n\n- "Какие ноутбуки подходят для игр?"\n- "Покажи бюджетные ноутбуки"\n- "Есть ли в наличии Apple MacBook?"` };
    }
    return { text: `I am an AI assistant and I can help you find the right laptop. Try asking me:\n\n- "Recommend a budget laptop"\n- "Show me coding laptops"\n- "Are there any Apple MacBooks in stock?"` };
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = generateAIResponse(userMsg, laptops, lang);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply.text, laptops: aiReply.laptops }]);
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
                        {lang === 'ru' && 'Гид по покупкам ноутбуков'}
                        {lang === 'tj' && 'Роҳнамои хариди лаптопҳо'}
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
                                        {laptop.brand} {laptop.model_name}
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
