import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Wrench, AlertTriangle, CheckCircle2, Zap, Layers, HardDrive, HelpCircle, Trash2, ShoppingBag, X, Check } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import './PCBuilder.css';

interface BuildComponent {
  id: string;
  name: string;
  brand: string;
  price: number;
  tdp?: number; // in Watts
  socket?: string; // AM5, LGA1700
  ramType?: string; // DDR5, DDR4
  capacity?: string;
  wattage?: number; // for PSU
  image: string;
}

type ComponentCategory = 'cpu' | 'mobo' | 'gpu' | 'ram' | 'ssd' | 'psu' | 'case';

interface PCBuild {
  cpu: BuildComponent | null;
  mobo: BuildComponent | null;
  gpu: BuildComponent | null;
  ram: BuildComponent | null;
  ssd: BuildComponent | null;
  psu: BuildComponent | null;
  case: BuildComponent | null;
}

const COMPONENTS: Record<ComponentCategory, BuildComponent[]> = {
  cpu: [
    { id: 'cpu-1', name: 'AMD Ryzen 7 7800X3D', brand: 'AMD', price: 4500, tdp: 120, socket: 'AM5', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=150&q=80' },
    { id: 'cpu-2', name: 'Intel Core i9-14900K', brand: 'Intel', price: 6200, tdp: 253, socket: 'LGA1700', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=150&q=80' },
    { id: 'cpu-3', name: 'AMD Ryzen 5 7600', brand: 'AMD', price: 2200, tdp: 65, socket: 'AM5', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=150&q=80' },
    { id: 'cpu-4', name: 'Intel Core i5-13400', brand: 'Intel', price: 2100, tdp: 65, socket: 'LGA1700', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=150&q=80' }
  ],
  mobo: [
    { id: 'mobo-1', name: 'ASUS ROG STRIX B650-A GAMING WIFI', brand: 'ASUS', price: 2800, socket: 'AM5', ramType: 'DDR5', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80' },
    { id: 'mobo-2', name: 'MSI PRO Z790-A MAX WIFI', brand: 'MSI', price: 3200, socket: 'LGA1700', ramType: 'DDR5', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80' },
    { id: 'mobo-3', name: 'Gigabyte B760M DS3H DDR4', brand: 'Gigabyte', price: 1500, socket: 'LGA1700', ramType: 'DDR4', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80' },
    { id: 'mobo-4', name: 'ASRock B650M-HDV/M.2', brand: 'ASRock', price: 1600, socket: 'AM5', ramType: 'DDR5', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80' }
  ],
  gpu: [
    { id: 'gpu-1', name: 'NVIDIA GeForce RTX 4090 24GB', brand: 'NVIDIA', price: 24000, tdp: 450, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=150&q=80' },
    { id: 'gpu-2', name: 'NVIDIA GeForce RTX 4070 Super 12GB', brand: 'NVIDIA', price: 8500, tdp: 220, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=150&q=80' },
    { id: 'gpu-3', name: 'AMD Radeon RX 7800 XT 16GB', brand: 'AMD', price: 7200, tdp: 263, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=150&q=80' },
    { id: 'gpu-4', name: 'NVIDIA GeForce RTX 3060 12GB', brand: 'NVIDIA', price: 3800, tdp: 170, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=150&q=80' }
  ],
  ram: [
    { id: 'ram-1', name: 'G.Skill Trident Z5 32GB (2x16) DDR5 6000MHz', brand: 'G.Skill', price: 1600, ramType: 'DDR5', capacity: '32GB', image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&w=150&q=80' },
    { id: 'ram-2', name: 'Crucial 16GB (1x16) DDR5 5600MHz', brand: 'Crucial', price: 800, ramType: 'DDR5', capacity: '16GB', image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&w=150&q=80' },
    { id: 'ram-3', name: 'Corsair Vengeance LPX 16GB (2x8) DDR4 3200MHz', brand: 'Corsair', price: 500, ramType: 'DDR4', capacity: '16GB', image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&w=150&q=80' }
  ],
  ssd: [
    { id: 'ssd-1', name: 'Samsung 990 Pro 2TB M.2 NVMe', brand: 'Samsung', price: 2200, capacity: '2TB', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=150&q=80' },
    { id: 'ssd-2', name: 'Crucial P3 Plus 1TB M.2 NVMe', brand: 'Crucial', price: 900, capacity: '1TB', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=150&q=80' },
    { id: 'ssd-3', name: 'Kingston A400 960GB SATA 2.5', brand: 'Kingston', price: 650, capacity: '960GB', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=150&q=80' }
  ],
  psu: [
    { id: 'psu-1', name: 'Corsair RM850x 850W Gold Fully Modular', brand: 'Corsair', price: 1800, wattage: 850, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=150&q=80' },
    { id: 'psu-2', name: 'EVGA SuperNOVA 1000 G+ 1000W', brand: 'EVGA', price: 2400, wattage: 1000, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=150&q=80' },
    { id: 'psu-3', name: 'Deepcool PK650D 650W Bronze', brand: 'Deepcool', price: 750, wattage: 650, image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=150&q=80' }
  ],
  case: [
    { id: 'case-1', name: 'Lian Li O11 Dynamic EVO (Black)', brand: 'Lian Li', price: 1900, image: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=150&q=80' },
    { id: 'case-2', name: 'NZXT H5 Flow (White)', brand: 'NZXT', price: 1200, image: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=150&q=80' },
    { id: 'case-3', name: 'Corsair 4000D Airflow (Black)', brand: 'Corsair', price: 1100, image: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=150&q=80' }
  ]
};

const CATEGORIES_META: Record<ComponentCategory, { label: { en: string; ru: string; tj: string }; icon: React.FC<any> }> = {
  cpu: { label: { en: 'Processor (CPU)', ru: 'Процессор (CPU)', tj: 'Протсессор (CPU)' }, icon: Cpu },
  mobo: { label: { en: 'Motherboard', ru: 'Материнская плата', tj: 'Модарплата' }, icon: Layers },
  gpu: { label: { en: 'Graphics Card (GPU)', ru: 'Видеокарта (GPU)', tj: 'Видеокарта (GPU)' }, icon: HelpCircle },
  ram: { label: { en: 'Memory (RAM)', ru: 'Оперативная память (RAM)', tj: 'Хотира (RAM)' }, icon: Layers },
  ssd: { label: { en: 'Storage (SSD)', ru: 'Накопитель (SSD)', tj: 'Нигаҳдорӣ (SSD)' }, icon: HardDrive },
  psu: { label: { en: 'Power Supply (PSU)', ru: 'Блок питания (PSU)', tj: 'Блоки ғизо (PSU)' }, icon: Zap },
  case: { label: { en: 'PC Case', ru: 'Корпус компьютера', tj: 'Корпуси компютер' }, icon: Wrench }
};

export const PCBuilder: React.FC = () => {
  const { lang } = useLang();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [build, setBuild] = useState<PCBuild>({
    cpu: null, mobo: null, gpu: null, ram: null, ssd: null, psu: null, case: null
  });

  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('cpu');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', partner: 'alif' });
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  const selectComponent = (category: ComponentCategory, item: BuildComponent) => {
    setBuild(prev => ({ ...prev, [category]: item }));
    toast.success(`${item.name} added to build`);
  };

  const removeComponent = (category: ComponentCategory) => {
    setBuild(prev => ({ ...prev, [category]: null }));
  };

  // Calculations
  const totalPrice = Object.values(build).reduce((sum, item) => sum + (item ? item.price : 0), 0);
  const totalTDP = (build.cpu?.tdp || 0) + (build.gpu?.tdp || 0);
  const recommendedPSU = totalTDP > 0 ? totalTDP + 150 : 0;

  // Compatibility Checks
  const warnings: string[] = [];
  
  if (build.cpu && build.mobo && build.cpu.socket !== build.mobo.socket) {
    warnings.push(
      lang === 'en'
        ? `⚠️ Socket mismatch: CPU is ${build.cpu.socket} but Motherboard is ${build.mobo.socket}`
        : lang === 'ru'
        ? `⚠️ Несовпадение сокета: Процессор имеет сокет ${build.cpu.socket}, а материнская плата — ${build.mobo.socket}`
        : `⚠️ Номувофиқати сокет: Протсессор сокети ${build.cpu.socket} дорад, аммо модарплата — ${build.mobo.socket}`
    );
  }

  if (build.ram && build.mobo && build.ram.ramType !== build.mobo.ramType) {
    warnings.push(
      lang === 'en'
        ? `⚠️ Memory mismatch: ${build.ram.name} is ${build.ram.ramType} but Motherboard requires ${build.mobo.ramType}`
        : lang === 'ru'
        ? `⚠️ Несовпадение памяти: Оперативная память типа ${build.ram.ramType}, а материнская плата требует ${build.mobo.ramType}`
        : `⚠️ Номувофиқати хотира: RAM намуди ${build.ram.ramType} аст, вале модарплата ${build.mobo.ramType}-ро талаб мекунад`
    );
  }

  if (build.psu && recommendedPSU > 0 && build.psu.wattage && build.psu.wattage < recommendedPSU) {
    warnings.push(
      lang === 'en'
        ? `⚠️ Insufficient Power: Selected PSU is ${build.psu.wattage}W, but recommended is at least ${recommendedPSU}W`
        : lang === 'ru'
        ? `⚠️ Недостаточно мощности: Блок питания имеет мощность ${build.psu.wattage}Вт, рекомендуется минимум ${recommendedPSU}Вт`
        : `⚠️ Норасоии барқ: Блоки ғизоии интихобшуда ${build.psu.wattage}Вт аст, аммо ҳадди аққал ${recommendedPSU}Вт тавсия мешавад`
    );
  }

  const isBuildComplete = build.cpu && build.mobo && build.gpu && build.ram && build.ssd && build.psu && build.case;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone) {
      toast.error(lang === 'en' ? 'Please fill all fields' : 'Пожалуйста, заполните все поля');
      return;
    }
    const randRef = 'SC-BUILD-' + Math.floor(1000 + Math.random() * 9000);
    setOrderRef(randRef);
    setOrderComplete(true);
    toast.success(lang === 'en' ? 'Order request sent!' : 'Запрос на заказ отправлен!');
  };

  const resetBuild = () => {
    setBuild({ cpu: null, mobo: null, gpu: null, ram: null, ssd: null, psu: null, case: null });
    setOrderComplete(false);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="pc-builder-container">
      <div className="pc-builder-header">
        <h1 className="builder-title">
          <Wrench className="title-icon animate-pulse" />
          {lang === 'en' ? 'Custom PC Builder' : lang === 'ru' ? 'Сборка ПК онлайн' : 'Созандаи компютер'}
        </h1>
        <p className="builder-subtitle">
          {lang === 'en'
            ? 'Select premium components, verify real-time power/socket compatibility, and place your order.'
            : lang === 'ru'
            ? 'Выбирайте премиум компоненты, проверяйте совместимость в реальном времени и отправляйте заказ.'
            : 'Қисмҳои олиро интихоб кунед, мувофиқати барқ ва сокетҳоро тафтиш кунед ва фармоиш диҳед.'}
        </p>
      </div>

      <div className="pc-builder-grid">
        {/* Left column: Slots & Selectors */}
        <div className="builder-slots-section">
          {/* Categories Tab Header */}
          <div className="category-tabs">
            {(Object.keys(COMPONENTS) as ComponentCategory[]).map(cat => {
              const Icon = CATEGORIES_META[cat].icon;
              const isSelected = activeCategory === cat;
              const hasSelected = !!build[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`category-tab-btn ${isSelected ? 'active' : ''} ${hasSelected ? 'has-val' : ''}`}
                >
                  <Icon size={16} />
                  <span>{CATEGORIES_META[cat].label[lang]}</span>
                  {hasSelected && <span className="check-dot">✓</span>}
                </button>
              );
            })}
          </div>

          {/* List of active category components to choose from */}
          <div className="components-selection-grid">
            <h3 className="section-small-title">
              {lang === 'en' ? 'Available Options' : lang === 'ru' ? 'Доступные варианты' : 'Вариантҳои дастрас'}
            </h3>
            <div className="components-scroll-list">
              {COMPONENTS[activeCategory].map(item => {
                const isChosen = build[activeCategory]?.id === item.id;
                return (
                  <div key={item.id} className={`comp-select-card ${isChosen ? 'chosen' : ''}`}>
                    <img src={item.image} alt={item.name} className="comp-card-img" />
                    <div className="comp-card-details">
                      <h4 className="comp-name">{item.name}</h4>
                      <p className="comp-brand">{item.brand}</p>
                      <div className="comp-badges">
                        {item.socket && <span className="comp-badge">Socket: {item.socket}</span>}
                        {item.ramType && <span className="comp-badge">RAM: {item.ramType}</span>}
                        {item.tdp && <span className="comp-badge">TDP: {item.tdp}W</span>}
                        {item.capacity && <span className="comp-badge">{item.capacity}</span>}
                        {item.wattage && <span className="comp-badge">{item.wattage}W</span>}
                      </div>
                    </div>
                    <div className="comp-card-price-action">
                      <span className="comp-price">{item.price.toLocaleString()} TJS</span>
                      <Button
                        size="sm"
                        variant={isChosen ? 'primary' : 'outline'}
                        onClick={() => selectComponent(activeCategory, item)}
                      >
                        {isChosen ? (
                          <>
                            <Check size={13} style={{ marginRight: '0.2rem' }} />
                            {lang === 'en' ? 'Selected' : lang === 'ru' ? 'Выбран' : 'Интихобшуда'}
                          </>
                        ) : (
                          lang === 'en' ? 'Select' : lang === 'ru' ? 'Выбрать' : 'Интихоб'
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Build summary & Chassis blueprint */}
        <div className="builder-summary-section">
          {/* Chassis Visualizer */}
          <div className="chassis-visualizer">
            <h3 className="chassis-title">
              {lang === 'en' ? 'Rig Configuration Blueprint' : lang === 'ru' ? 'Интерактивная схема сборки' : 'Хатти тарҳи компютер'}
            </h3>
            <div className="case-chassis">
              {/* Motherboard slot */}
              <div className={`chassis-slot slot-mobo ${build.mobo ? 'active' : ''}`}>
                <span>Motherboard: {build.mobo ? build.mobo.name : 'Empty Slot'}</span>
              </div>
              {/* CPU slot */}
              <div className={`chassis-slot slot-cpu ${build.cpu ? 'active animate-pulse' : ''}`}>
                <span>CPU: {build.cpu ? build.cpu.name : 'Empty Slot'}</span>
              </div>
              {/* RAM slot */}
              <div className={`chassis-slot slot-ram ${build.ram ? 'active' : ''}`}>
                <span>RAM: {build.ram ? build.ram.name : 'Empty Slot'}</span>
              </div>
              {/* SSD slot */}
              <div className={`chassis-slot slot-ssd ${build.ssd ? 'active' : ''}`}>
                <span>M.2 SSD: {build.ssd ? build.ssd.name : 'Empty Slot'}</span>
              </div>
              {/* GPU slot */}
              <div className={`chassis-slot slot-gpu ${build.gpu ? 'active glow-gpu' : ''}`}>
                <span>GPU: {build.gpu ? build.gpu.name : 'Empty Slot'}</span>
              </div>
              {/* PSU slot */}
              <div className={`chassis-slot slot-psu ${build.psu ? 'active' : ''}`}>
                <span>PSU: {build.psu ? build.psu.name : 'Empty Slot'}</span>
              </div>
            </div>
          </div>

          {/* Current Build Specifications List */}
          <div className="specs-summary-list">
            <h3 className="section-small-title">
              {lang === 'en' ? 'Configuration Details' : lang === 'ru' ? 'Детали конфигурации' : 'Тафсилоти сохтмон'}
            </h3>
            <div className="specs-list">
              {(Object.keys(CATEGORIES_META) as ComponentCategory[]).map(cat => {
                const item = build[cat];
                return (
                  <div key={cat} className="spec-slot-item">
                    <span className="slot-name">{CATEGORIES_META[cat].label[lang]}:</span>
                    {item ? (
                      <div className="slot-val-box">
                        <span className="slot-val-text">{item.name}</span>
                        <span className="slot-val-price">{item.price.toLocaleString()} TJS</span>
                        <button className="slot-remove-btn" onClick={() => removeComponent(cat)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <span className="slot-empty-text">
                        {lang === 'en' ? '[Not selected]' : lang === 'ru' ? '[Не выбрано]' : '[Интихоб нашудааст]'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calculations and TDP */}
            <div className="builder-metrics-box">
              <div className="metric-row">
                <span>{lang === 'en' ? 'Estimated Power TDP:' : lang === 'ru' ? 'Расчетное TDP:' : 'TDP-и тахминӣ:'}</span>
                <strong>{totalTDP} W</strong>
              </div>
              <div className="metric-row">
                <span>{lang === 'en' ? 'Recommended PSU Power:' : lang === 'ru' ? 'Рекомендуемый БП:' : 'БП-и тавсияшаванда:'}</span>
                <strong>{recommendedPSU} W</strong>
              </div>
            </div>

            {/* Warnings list */}
            {warnings.length > 0 && (
              <div className="builder-warnings-box">
                {warnings.map((w, idx) => (
                  <div key={idx} className="warning-item">
                    <AlertTriangle size={14} className="warning-icon" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total Price & Checkout trigger */}
            <div className="builder-action-footer">
              <div className="total-price-box">
                <span className="price-label">{lang === 'en' ? 'Total Rig Cost:' : lang === 'ru' ? 'Итоговая стоимость:' : 'Арзиши умумӣ:'}</span>
                <span className="price-val">{totalPrice.toLocaleString()} TJS</span>
              </div>
              <Button
                variant="primary"
                className="checkout-btn"
                disabled={!isBuildComplete || warnings.length > 0}
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error(lang === 'en' ? 'Please log in to submit a build order.' : 'Войдите в систему, чтобы отправить заказ.');
                    navigate('/login');
                    return;
                  }
                  setIsCheckoutOpen(true);
                }}
              >
                <ShoppingBag size={15} style={{ marginRight: '0.4rem' }} />
                {lang === 'en' ? 'Order Custom PC Build' : lang === 'ru' ? 'Заказать сборку' : 'Фармоиши сохтмон'}
              </Button>
              {!isBuildComplete && (
                <p className="builder-help-text">
                  {lang === 'en' ? '* Select all components to enable ordering.' : '* Выберите все компоненты для заказа.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal-card checkout-modal-card">
            <div className="modal-header">
              <h3>
                {lang === 'en' ? 'Confirm Custom PC Order' : lang === 'ru' ? 'Подтверждение заказа ПК' : 'Тасдиқи супориши компютер'}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsCheckoutOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {!orderComplete ? (
              <form onSubmit={handleCheckoutSubmit} className="checkout-form-grid">
                <p style={{ gridColumn: '1 / -1', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {lang === 'en'
                    ? 'Review your config specifications, choose a payment method, and complete order request.'
                    : 'Проверьте конфигурацию, выберите способ оплаты и завершите заказ.'}
                </p>

                <div className="form-field">
                  <label>{lang === 'en' ? 'Your Name' : 'Ваше имя'}</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.name}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="form-field">
                  <label>{lang === 'en' ? 'Contact Phone' : 'Контактный телефон'}</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.phone}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="form-field full-width">
                  <label>{lang === 'en' ? 'Payment Partner / Installments' : 'Способ оплаты / Рассрочка'}</label>
                  <select
                    value={checkoutForm.partner}
                    onChange={e => setCheckoutForm(prev => ({ ...prev, partner: e.target.value }))}
                  >
                    <option value="cash">{lang === 'en' ? 'Full Payment Cash/Card on Delivery' : 'Полная оплата наличными/картой'}</option>
                    <option value="alif">Salom Installments (Alif)</option>
                    <option value="humo">Humo Installments</option>
                    <option value="eskhata">Eskhata installments</option>
                    <option value="dc">Dushanbe City wallet QR</option>
                  </select>
                </div>

                <div className="order-price-summary">
                  <span>{lang === 'en' ? 'Final Cost:' : 'Итого к оплате:'}</span>
                  <strong>{totalPrice.toLocaleString()} TJS</strong>
                </div>

                <div className="form-actions">
                  <Button type="submit" variant="primary">
                    {lang === 'en' ? 'Submit Order' : 'Отправить заказ'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                    {lang === 'en' ? 'Cancel' : 'Отмена'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="order-success-screen">
                <CheckCircle2 size={50} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                <h4>
                  {lang === 'en' ? 'Order Request Placed!' : 'Заказ успешно отправлен!'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1rem' }}>
                  {lang === 'en'
                    ? `Your custom PC build request is registered under reference: ${orderRef}. Our manager will call you shortly.`
                    : `Ваш запрос на сборку ПК зарегистрирован с номером: ${orderRef}. Наш менеджер свяжется с вами.`}
                </p>
                <div className="success-actions">
                  <Button variant="primary" onClick={resetBuild}>
                    {lang === 'en' ? 'Build Another PC' : 'Собрать другой ПК'}
                  </Button>
                  <Button variant="outline" onClick={() => { setIsCheckoutOpen(false); navigate('/catalog'); }}>
                    {lang === 'en' ? 'Close' : 'Закрыть'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
