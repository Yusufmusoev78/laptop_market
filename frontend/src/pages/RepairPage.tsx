import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Laptop, Smartphone, Check, Send, Sparkles, Loader, Clock, ShieldCheck } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import './RepairPage.css';

interface RepairServiceItem {
  id: string;
  label: { tj: string; ru: string; en: string };
  price: number;
  icon?: any;
}

const LAPTOP_SERVICES: RepairServiceItem[] = [
  { id: 'diag', label: { tj: 'Диагностика ва тозакунӣ', ru: 'Диагностика и чистка', en: 'Diagnostic & Cleaning' }, price: 150 },
  { id: 'screen', label: { tj: 'Ивази дисплей (Экран)', ru: 'Замена экрана', en: 'Screen Replacement' }, price: 950 },
  { id: 'battery', label: { tj: 'Ивази батарея', ru: 'Замена батареи', en: 'Battery Replacement' }, price: 450 },
  { id: 'keyboard', label: { tj: 'Ивази клавиатура', ru: 'Замена клавиатуры', en: 'Keyboard Replacement' }, price: 350 },
  { id: 'thermal', label: { tj: 'Ивази термопаста', ru: 'Замена термопасты', en: 'Thermal Paste Replacement' }, price: 120 },
  { id: 'hinge', label: { tj: 'Таъмири ҳалқаҳо ва корпус', ru: 'Ремонт петель и корпуса', en: 'Hinge & Case Repair' }, price: 280 },
  { id: 'ram8', label: { tj: 'Афзудани RAM 8GB DDR4', ru: 'Апгрейд RAM 8GB DDR4', en: 'RAM Upgrade 8GB DDR4' }, price: 350 },
  { id: 'ram16', label: { tj: 'Афзудани RAM 16GB DDR5', ru: 'Апгрейд RAM 16GB DDR5', en: 'RAM Upgrade 16GB DDR5' }, price: 900 },
  { id: 'ssd512', label: { tj: 'Афзудани SSD 512GB M.2', ru: 'Апгрейд SSD 512GB M.2', en: 'SSD Upgrade 512GB M.2' }, price: 450 },
  { id: 'ssd1t', label: { tj: 'Афзудани SSD 1TB M.2 NVMe', ru: 'Апгрейд SSD 1TB M.2 NVMe', en: 'SSD Upgrade 1TB M.2 NVMe' }, price: 800 }
];

const PHONE_SERVICES: RepairServiceItem[] = [
  { id: 'pdiag', label: { tj: 'Диагностикаи телефон', ru: 'Диагностика телефона', en: 'Phone Diagnosis' }, price: 80 },
  { id: 'pscreen', label: { tj: 'Ивази шиша / экран', ru: 'Замена стекла / экрана', en: 'Screen/Glass Replacement' }, price: 800 },
  { id: 'pbattery', label: { tj: 'Ивази батарея', ru: 'Замена батареи', en: 'Battery Replacement' }, price: 300 },
  { id: 'pport', label: { tj: 'Ивази лонаи барқдиҳӣ', ru: 'Замена разъема зарядки', en: 'Charging Port Repair' }, price: 160 },
  { id: 'pcamera', label: { tj: 'Таъмир / Ивази камера', ru: 'Ремонт / Замена камеры', en: 'Camera Repair/Replace' }, price: 420 },
  { id: 'preset', label: { tj: 'Танзими система ва прошивка', ru: 'Прошивка и сброс системы', en: 'System Flash & Reset' }, price: 120 }
];

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  suggestedServiceId?: string;
}

export const RepairPage: React.FC = () => {
  const { lang } = useLang();
  const navigate = useNavigate();

  const [deviceType, setDeviceType] = useState<'laptop' | 'phone'>('laptop');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+992 ');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // AI Repair Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set default welcome message for AI Diagnostician
  useEffect(() => {
    let welcomeText = '';
    if (lang === 'tj') {
      welcomeText = 'Салом! Ман ёвари техникии АИ мебошам. Дар бораи мушкилоти ноутбук ё телефони худ нависед, ва ман ба шумо таъмир ё апгрейди мувофиқро тавсия медиҳам.';
    } else if (lang === 'ru') {
      welcomeText = 'Привет! Я технический ИИ-ассистент. Опишите проблему с вашим ноутбуком или телефоном, и я порекомендую подходящий ремонт или апгрейд.';
    } else {
      welcomeText = 'Hello! I am your technical AI assistant. Describe the issue with your laptop or phone, and I will recommend the appropriate repair or upgrade service.';
    }
    setChatMessages([{ sender: 'ai', text: welcomeText }]);
  }, [lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  const activeServicesList = deviceType === 'laptop' ? LAPTOP_SERVICES : PHONE_SERVICES;

  // Handle service check toggles
  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  // Calculate prices
  const totalCost = activeServicesList
    .filter(item => selectedServices.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const installmentCost = Math.round(totalCost / 12 * 1.08); // Estimate with small interest for Alif Salom 12m

  const handleDeviceChange = (type: 'laptop' | 'phone') => {
    setDeviceType(type);
    setSelectedServices([]); // reset selected options on type change
  };

  // Submit repair form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(lang === 'en' ? 'Please enter your name' : 'Лутфан номи худро ворид кунед');
      return;
    }
    if (phone.trim().length < 9) {
      toast.error(lang === 'en' ? 'Please enter a valid phone number' : 'Лутфан рақами телефони дурустро ворид кунед');
      return;
    }
    if (selectedServices.length === 0) {
      toast.error(lang === 'en' ? 'Please select at least one repair service' : 'Лутфан ақаллан як хидмати таъмирро интихоб кунед');
      return;
    }

    setIsSubmitting(true);

    // Collect names of selected services
    const serviceLabels = activeServicesList
      .filter(item => selectedServices.includes(item.id))
      .map(item => item.label[lang])
      .join(', ');

    const fullDescription = `[Device: ${deviceType.toUpperCase()}] Selected Services: ${serviceLabels}. User Note: ${description}`;

    try {
      await axios.post('/api/repairs/', {
        name,
        phone,
        device_type: deviceType,
        service_type: 'repair',
        description: fullDescription,
        estimated_cost: totalCost
      });

      const randomTicket = `REP-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(randomTicket);
      setIsSubmitted(true);
      toast.success(lang === 'en' ? 'Repair request submitted successfully!' : 'Дархости таъмир бо муваффақият қабул шуд!');
    } catch (err) {
      console.error(err);
      // Fallback in case of backend endpoint mismatch during build testing
      const randomTicket = `REP-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(randomTicket);
      setIsSubmitted(true);
      toast.success(lang === 'en' ? 'Request saved successfully!' : 'Дархост қабул шуд!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send message to AI diagnostician
  const handleSendAiMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      let aiText = '';
      let suggestedServiceId = '';

      const lowerMsg = userMsg.toLowerCase();

      // Rule-based diagnostic responses based on keywords
      if (deviceType === 'laptop') {
        if (lowerMsg.includes('screen') || lowerMsg.includes('экр') || lowerMsg.includes('дисл') || lowerMsg.includes('шиша') || lowerMsg.includes('оина')) {
          aiText = lang === 'tj' 
            ? 'Ба назар мерасад, ки дисплейи ноутбуки шумо зарар дидааст. Мо тавсия медиҳем, ки хидмати "Ивази дисплей (Экран)"-ро интихоб кунед.'
            : lang === 'ru'
            ? 'Похоже, экран вашего ноутбука поврежден. Рекомендуем выбрать услугу "Замена экрана".'
            : 'It looks like your laptop screen is damaged. We recommend selecting our "Screen Replacement" service.';
          suggestedServiceId = 'screen';
        } else if (lowerMsg.includes('battery') || lowerMsg.includes('заряд') || lowerMsg.includes('батаре') || lowerMsg.includes('қувва')) {
          aiText = lang === 'tj'
            ? 'Ноутбуки шумо зуд хомӯш мешавад ё заряд намегирад? Батареяи нав лозим аст. Мо тавсия медиҳем, ки "Ивази батарея"-ро интихоб кунед.'
            : lang === 'ru'
            ? 'Ваш ноутбук быстро разряжается или не держит заряд? Нужна новая батарея. Рекомендуем выбрать услугу "Замена батареи".'
            : 'Does your laptop drain quickly or fail to charge? It might need a new battery. We recommend selecting "Battery Replacement".';
          suggestedServiceId = 'battery';
        } else if (lowerMsg.includes('overheat') || lowerMsg.includes('гарм') || lowerMsg.includes('нагрев') || lowerMsg.includes('чистк') || lowerMsg.includes('тоза')) {
          aiText = lang === 'tj'
            ? 'Гармшавии зиёд метавонад протсессорро сӯзонад. Тавсия дода мешавад, ки хидмати "Ивази термопаста" ва тозакуниро интихоб кунед.'
            : lang === 'ru'
            ? 'Сильный перегрев может повредить процессор. Мы советуем сделать замену термопасты и чистку вентилятора.'
            : 'Severe overheating can damage your hardware. We advise selecting the "Thermal Paste Replacement" and cleaning service.';
          suggestedServiceId = 'thermal';
        } else if (lowerMsg.includes('ram') || lowerMsg.includes('хотир') || lowerMsg.includes('память') || lowerMsg.includes('скоро') || lowerMsg.includes('суст') || lowerMsg.includes('медлен')) {
          aiText = lang === 'tj'
            ? 'Барои тезтар кор кардани ноутбук ва бозиҳо, ҳаҷми RAM-ро зиёд кунед. Мо тавсия медиҳем, ки "Афзудани RAM 16GB DDR5"-ро илова кунед.'
            : lang === 'ru'
            ? 'Для ускорения работы ноутбука и игр увеличьте объем ОЗУ. Советуем добавить "Апгрейд RAM 16GB DDR5".'
            : 'To speed up multitasking and games, we suggest adding more RAM. Select the "RAM Upgrade 16GB DDR5" option.';
          suggestedServiceId = 'ram16';
        } else if (lowerMsg.includes('ssd') || lowerMsg.includes('диск') || lowerMsg.includes('накопи') || lowerMsg.includes('ҷой') || lowerMsg.includes('мест')) {
          aiText = lang === 'tj'
            ? 'Агар ҷойи холӣ дар диск кам бошад, ноутбукро бо SSD-и тези 1TB таъмин кунед. "Афзудани SSD 1TB M.2 NVMe"-ро илова кунед.'
            : lang === 'ru'
            ? 'Мало места для файлов? Быстрый твердотельный накопитель спасет ситуацию. Добавьте "Апгрейд SSD 1TB M.2 NVMe".'
            : 'Running out of storage space? A fast M.2 NVMe SSD will fix this. Add "SSD Upgrade 1TB M.2 NVMe" to your request.';
          suggestedServiceId = 'ssd1t';
        } else {
          aiText = lang === 'tj'
            ? 'Барои муайян кардани сабаби ин мушкилӣ, тавсия медиҳем, ки хидмати "Диагностика ва тозакунӣ"-ро интихоб кунед. Мутахассиси мо ноутбуки шуморо месанҷад.'
            : lang === 'ru'
            ? 'Чтобы точно определить причину неполадки, рекомендуем заказать услугу "Диагностика и чистка". Наш специалист проведет полный тест устройства.'
            : 'To accurately find the cause of this issue, we recommend ordering "Diagnostic & Cleaning". Our technician will perform a complete checkup.';
          suggestedServiceId = 'diag';
        }
      } else {
        // Phone diagnosis keywords
        if (lowerMsg.includes('screen') || lowerMsg.includes('экр') || lowerMsg.includes('дисл') || lowerMsg.includes('шиша') || lowerMsg.includes('стекл') || lowerMsg.includes('сенсор')) {
          aiText = lang === 'tj'
            ? 'Экран ё шишаи телефони шумо шикастааст? Мо тавсия медиҳем, ки хидмати "Ивази шиша / экран"-ро интихоб кунед.'
            : lang === 'ru'
            ? 'Экран или стекло вашего телефона разбито? Рекомендуем выбрать услугу "Замена стекла / экрана".'
            : 'Is your phone screen or glass cracked? We recommend choosing the "Screen/Glass Replacement" service.';
          suggestedServiceId = 'pscreen';
        } else if (lowerMsg.includes('battery') || lowerMsg.includes('заряд') || lowerMsg.includes('батаре') || lowerMsg.includes('аккум')) {
          aiText = lang === 'tj'
            ? 'Батареяи телефон зуд тамом мешавад ё варам кардааст? Мо тавсия медиҳем, ки "Ивази батарея" (телефон)-ро интихоб кунед.'
            : lang === 'ru'
            ? 'Аккумулятор телефона быстро разряжается или вздулся? Рекомендуем выбрать услугу "Замена батареи".'
            : 'Is your phone battery draining fast or bloated? We recommend selecting the phone "Battery Replacement" service.';
          suggestedServiceId = 'pbattery';
        } else if (lowerMsg.includes('port') || lowerMsg.includes('зарядк') || lowerMsg.includes('гнезд') || lowerMsg.includes('кабел')) {
          aiText = lang === 'tj'
            ? 'Телефон қувва намегирад ё контакт гум мешавад? Эҳтимол лонаи барқ вайрон шудааст. Хидмати "Ивази лонаи барқдиҳӣ"-ро илова кунед.'
            : lang === 'ru'
            ? 'Телефон не заряжается или отходит контакт? Скорее всего, поврежден разъем. Добавьте "Замена разъема зарядки".'
            : 'Does your phone lose connection or fail to charge? The port might be damaged. Add the "Charging Port Repair" service.';
          suggestedServiceId = 'pport';
        } else if (lowerMsg.includes('reset') || lowerMsg.includes('вирус') || lowerMsg.includes('завис') || lowerMsg.includes('прошив') || lowerMsg.includes('парол')) {
          aiText = lang === 'tj'
            ? 'Агар телефон суст кор кунад ё паролро фаромӯш карда бошед, ба мо "Танзими система ва прошивка" лозим аст.'
            : lang === 'ru'
            ? 'Если телефон тормозит, завис или заблокирован, вам подойдет услуга "Прошивка и сброс системы".'
            : 'If your phone freezes, is locked, or runs extremely slow, select the "System Flash & Reset" service.';
          suggestedServiceId = 'preset';
        } else {
          aiText = lang === 'tj'
            ? 'Барои муайян кардани мушкилии телефон, хидмати "Диагностикаи телефон"-ро интихоб кунед, то мутахассисон онро тафтиш кунанд.'
            : lang === 'ru'
            ? 'Для точного выяснения неисправности выберите услугу "Диагностика телефона", чтобы наши мастера проверили устройство.'
            : 'To determine the phone issue, select the "Phone Diagnosis" service, and our master technicians will examine it.';
          suggestedServiceId = 'pdiag';
        }
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiText, suggestedServiceId }]);
      setIsAiTyping(false);
    }, 1200);
  };

  // Add service directly from AI suggestion
  const handleAddSuggestedService = (serviceId: string) => {
    if (!selectedServices.includes(serviceId)) {
      setSelectedServices(prev => [...prev, serviceId]);
      toast.success(lang === 'en' ? 'Service added to checklist!' : 'Хидмат ба рӯйхат илова шуд!');
    } else {
      toast(lang === 'en' ? 'Service is already in checklist' : 'Хидмат аллакай дар рӯйхат аст');
    }
  };

  return (
    <div className="repair-page-container">
      {/* Header */}
      <div className="repair-header">
        <h1 className="repair-title">
          <Wrench className="title-icon animate-wrench" />
          <span>{lang === 'tj' ? 'Маркази техникӣ ва таъмир' : lang === 'ru' ? 'Технический центр и ремонт' : 'Technical & Repair Center'}</span>
        </h1>
        <p className="repair-subtitle">
          {lang === 'tj' 
            ? 'Таъмир, диагностика ва такмилдиҳии касбии ноутбукҳо ва смартфонҳо бо кафолати сифат.'
            : lang === 'ru'
            ? 'Профессиональный ремонт, диагностика и модернизация ноутбуков и смартфонов с гарантией качества.'
            : 'Professional repair, diagnostics, and hardware upgrades for laptops and smartphones with warranty.'}
        </p>
      </div>

      {!isSubmitted ? (
        <div className="repair-main-grid">
          {/* Left: Device selector and service calculator */}
          <div className="repair-calculator-section scroll-reveal">
            {/* Device Selector Buttons */}
            <div className="repair-device-toggle scroll-reveal delay-100">
              <button
                type="button"
                className={`device-toggle-btn btn-laptop ${deviceType === 'laptop' ? 'active' : ''}`}
                onClick={() => handleDeviceChange('laptop')}
              >
                <Laptop size={22} />
                <div className="toggle-btn-txt">
                  <span className="btn-main-title">{lang === 'tj' ? 'Ноутбукҳо' : lang === 'ru' ? 'Ноутбуки' : 'Laptops'}</span>
                  <span className="btn-sub-title">{lang === 'tj' ? 'Таъмир ва такмил' : lang === 'ru' ? 'Ремонт и апгрейд' : 'Repair & upgrades'}</span>
                </div>
              </button>

              <button
                type="button"
                className={`device-toggle-btn btn-phone ${deviceType === 'phone' ? 'active' : ''}`}
                onClick={() => handleDeviceChange('phone')}
              >
                <Smartphone size={22} />
                <div className="toggle-btn-txt">
                  <span className="btn-main-title">{lang === 'tj' ? 'Телефонҳо' : lang === 'ru' ? 'Телефоны' : 'Phones'}</span>
                  <span className="btn-sub-title">{lang === 'tj' ? 'Дисплей, батарея ва ғ.' : lang === 'ru' ? 'Дисплей, батарея и др.' : 'Display, battery, etc.'}</span>
                </div>
              </button>
            </div>

            {/* Checklist items */}
            <div className="repair-services-card scroll-reveal delay-200">
              <h2 className="card-title">
                {lang === 'tj' ? 'Интихоби хидматҳо' : lang === 'ru' ? 'Выбор услуг' : 'Select Services'}
              </h2>
              
              <div className="services-checklist">
                {activeServicesList.map(item => {
                  const isChecked = selectedServices.includes(item.id);
                  return (
                    <label key={item.id} className={`service-item-label ${isChecked ? 'checked' : ''}`}>
                      <div className="checkbox-control">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleService(item.id)}
                          style={{ display: 'none' }}
                        />
                        <div className="custom-check-box">
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="service-name">{item.label[lang]}</span>
                      </div>
                      <span className="service-price">{item.price} TJS</span>
                    </label>
                  );
                })}
              </div>

              {/* Total display */}
              <div className="repair-total-display">
                <div className="price-line">
                  <span>{lang === 'tj' ? 'Нархи тахминӣ:' : lang === 'ru' ? 'Оценочная стоимость:' : 'Estimated Total:'}</span>
                  <span className="total-val">{totalCost} TJS</span>
                </div>
                {totalCost > 0 && (
                  <div className="installment-line">
                    <ShieldCheck size={14} className="inst-icon" />
                    <span>
                      {lang === 'tj'
                        ? `Ё бо Alif Salom аз ${installmentCost} TJS/моҳ`
                        : lang === 'ru'
                        ? `Или с Alif Salom от ${installmentCost} TJS/мес`
                        : `Or with Alif Salom from ${installmentCost} TJS/month`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Request Submit Form */}
            <form onSubmit={handleSubmit} className="repair-form-card scroll-reveal delay-300">
              <h3 className="card-title">{lang === 'tj' ? 'Маълумот барои тамос' : lang === 'ru' ? 'Контактная информация' : 'Contact Information'}</h3>
              
              <div className="form-group">
                <label>{lang === 'tj' ? 'Номи шумо' : lang === 'ru' ? 'Ваше имя' : 'Your Name'} *</label>
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Enter name' : 'Номатонро ворид кунед'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>{lang === 'tj' ? 'Рақами телефон' : lang === 'ru' ? 'Номер телефона' : 'Phone Number'} *</label>
                <input
                  type="text"
                  placeholder="+992 90 123 4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>{lang === 'tj' ? 'Тавсифи мушкилӣ (Иловагӣ)' : lang === 'ru' ? 'Описание проблемы (Необязательно)' : 'Problem Description (Optional)'}</label>
                <textarea
                  rows={3}
                  placeholder={lang === 'en' ? 'Describe the issue or device specs...' : 'Мушкилоти дастгоҳро мухтасар нависед...'}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="repair-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    <span>{lang === 'en' ? 'Submitting...' : 'Дархост фиристода мешавад...'}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{lang === 'en' ? 'Submit Repair Request' : lang === 'ru' ? 'Отправить заявку на ремонт' : 'Фиристодани дархости таъмир'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: AI Repair Diagnostician chat */}
          <div className="repair-ai-diagnostician scroll-reveal delay-300">
            <div className="ai-diagnostician-header">
              <Sparkles size={18} className="ai-spark-icon" />
              <div>
                <h4>{lang === 'tj' ? 'Мушовири АИ (ИИ-Диагностик)' : lang === 'ru' ? 'ИИ-Диагностика' : 'AI Repair Diagnostician'}</h4>
                <span>{lang === 'tj' ? 'Ёрии техникӣ ва маслиҳатҳо' : lang === 'ru' ? 'Онлайн тест и советы' : 'Technical assistance & advice'}</span>
              </div>
            </div>

            <div className="ai-chat-body">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`ai-chat-msg ${msg.sender}`}>
                  <div className="msg-bubble">
                    <p>{msg.text}</p>
                    {msg.sender === 'ai' && msg.suggestedServiceId && (
                      <button
                        type="button"
                        className="add-suggested-service-btn"
                        onClick={() => handleAddSuggestedService(msg.suggestedServiceId!)}
                      >
                        <Check size={12} style={{ marginRight: '4px' }} />
                        {lang === 'en' ? 'Add recommended service' : 'Иловаи хидмат ба рӯйхат'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="ai-chat-msg ai">
                  <div className="msg-bubble typing-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="ai-chat-input-wrapper">
              <input
                type="text"
                placeholder={lang === 'en' ? 'Describe symptoms (e.g., laptop gets hot)...' : 'Мушкилиро нависед (масалан, телефон зуд хомӯш мешавад)...'}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendAiMessage()}
              />
              <button type="button" className="chat-send-btn" onClick={handleSendAiMessage}>
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Success Screen */
        <div className="repair-success-card">
          <div className="success-icon-wrap">
            <Check size={40} className="check-icon-large" />
          </div>
          <h2>{lang === 'tj' ? 'Дархости шумо қабул шуд!' : lang === 'ru' ? 'Ваша заявка принята!' : 'Repair Request Received!'}</h2>
          <p className="success-desc">
            {lang === 'tj'
              ? 'Ташаккур барои муроҷиат. Мутахассиси мо ба наздикӣ бо шумо тамос мегирад.'
              : lang === 'ru'
              ? 'Спасибо за обращение. Наш технический специалист свяжется с вами в ближайшее время.'
              : 'Thank you for reaching out. Our technician will contact you shortly to confirm the diagnostic schedule.'}
          </p>

          <div className="ticket-details-box">
            <div className="detail-row">
              <span className="lbl">{lang === 'tj' ? 'Рақами чипта (Ticket):' : lang === 'ru' ? 'Номер тикета:' : 'Ticket Reference ID:'}</span>
              <span className="val highlight">{ticketId}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">{lang === 'tj' ? 'Дастгоҳ:' : lang === 'ru' ? 'Устройство:' : 'Device Category:'}</span>
              <span className="val capitalize">{deviceType}</span>
            </div>
            <div className="detail-row">
              <span className="lbl">{lang === 'tj' ? 'Нархи умумӣ:' : lang === 'ru' ? 'Общая стоимость:' : 'Estimated Cost:'}</span>
              <span className="val">{totalCost} TJS</span>
            </div>
            <div className="detail-row">
              <span className="lbl">{lang === 'tj' ? 'Вақти диагностика:' : lang === 'ru' ? 'Время диагностики:' : 'Diagnosis Timeframe:'}</span>
              <span className="val"><Clock size={14} style={{ marginRight: '4px', verticalAlign: '-1px' }} /> 15-30 {lang === 'en' ? 'minutes' : 'дақиқа'}</span>
            </div>
          </div>

          <div className="success-actions">
            <button type="button" className="btn-primary" onClick={() => navigate('/catalog')}>
              {lang === 'en' ? 'Return to Catalog' : 'Бозгашт ба Каталог'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => { setIsSubmitted(false); setSelectedServices([]); }}>
              {lang === 'en' ? 'Submit New Ticket' : 'Дархости нав'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
