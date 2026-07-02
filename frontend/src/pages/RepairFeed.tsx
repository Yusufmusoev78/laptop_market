import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Laptop, Smartphone, Check, Send, Sparkles, Loader, Clock, ShieldCheck, MessageSquare, Play, Phone as PhoneIcon } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { RepairChatWindow } from '../components/ui/RepairChatWindow';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import './RepairFeed.css';

interface RepairServiceItem {
  id: string;
  label: { tj: string; ru: string; en: string };
  price: number;
}

const LAPTOP_SERVICES: RepairServiceItem[] = [
  { id: 'diag', label: { tj: 'Диагностика ва тозакунӣ', ru: 'Диагностика и чистка', en: 'Diagnostic & Cleaning' }, price: 150 },
  { id: 'screen', label: { tj: 'Ивази дисплей (Экран)', ru: 'Замена экрана', en: 'Screen Replacement' }, price: 950 },
  { id: 'battery', label: { tj: 'Ивази батарея', ru: 'Замена батареи', en: 'Battery Replacement' }, price: 450 },
  { id: 'keyboard', label: { tj: 'Ивази клавиатура', ru: 'Замена клавиатуры', en: 'Keyboard Replacement' }, price: 350 },
  { id: 'thermal', label: { tj: 'Ивази термопаста', ru: 'Замена термопасты', en: 'Thermal Paste Replacement' }, price: 120 },
  { id: 'hinge', label: { tj: 'Таъмири ҳалқаҳо ва корпус', ru: 'Ремонт петель и корпуса', en: 'Hinge & Case Repair' }, price: 280 }
];

const PHONE_SERVICES: RepairServiceItem[] = [
  { id: 'pdiag', label: { tj: 'Диагностикаи телефон', ru: 'Диагностика телефона', en: 'Phone Diagnosis' }, price: 80 },
  { id: 'pscreen', label: { tj: 'Ивази шиша / экран', ru: 'Замена стекла / экрана', en: 'Screen/Glass Replacement' }, price: 800 },
  { id: 'pbattery', label: { tj: 'Ивази батарея', ru: 'Замена батареи', en: 'Battery Replacement' }, price: 300 },
  { id: 'pport', label: { tj: 'Ивази лонаи барқдиҳӣ', ru: 'Замена разъема зарядки', en: 'Charging Port Repair' }, price: 160 }
];

interface RepairTicket {
  id: number;
  client_id: number | null;
  usto_id: number | null;
  name: string;
  phone: string;
  device_type: string;
  service_type: string;
  description: string;
  estimated_cost: number;
  status: string;
  created_at: string;
}

export const RepairFeed: React.FC = () => {
  const { lang } = useLang();
  const { user } = useAuth();
  const { registerListener } = useNotifications();
  const navigate = useNavigate();

  // Calculator Form State
  const [deviceType, setDeviceType] = useState<'laptop' | 'phone'>('laptop');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+992 ');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Repair Tickets Feed State
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [claimBusyId, setClaimBusyId] = useState<number | null>(null);
  const [activeChatTicket, setActiveChatTicket] = useState<RepairTicket | null>(null);

  const activeServicesList = deviceType === 'laptop' ? LAPTOP_SERVICES : PHONE_SERVICES;

  // Load initial tickets
  const fetchTickets = async () => {
    if (!user) {
      setLoadingFeed(false);
      return;
    }
    try {
      setLoadingFeed(true);
      if (user.role === 'usto') {
        // Masters load both claimed and unclaimed
        const [claimedRes, unclaimedRes] = await Promise.all([
          apiClient.get<RepairTicket[]>('/repairs/'),
          apiClient.get<RepairTicket[]>('/repairs/?unclaimed=true')
        ]);
        // Merge without duplicates
        const merged = [...claimedRes.data, ...unclaimedRes.data];
        const unique = merged.filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);
        // Sort descending by id
        unique.sort((a, b) => b.id - a.id);
        setTickets(unique);
      } else {
        // Normal client gets their own tickets
        const res = await apiClient.get<RepairTicket[]>('/repairs/');
        res.data.sort((a, b) => b.id - a.id);
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Failed to load repair feed:', err);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  // WebSocket Live Updates Handler
  useEffect(() => {
    if (!user) return;

    const unsubNewTicket = registerListener('new_repair_ticket', (data) => {
      const ticket: RepairTicket = data.ticket;
      
      // If client, only add if it belongs to them
      if (user.role !== 'usto' && ticket.client_id !== user.id) {
        return;
      }

      setTickets(prev => {
        if (prev.some(t => t.id === ticket.id)) return prev;
        return [ticket, ...prev];
      });
      toast.success(lang === 'en' ? 'New repair request added to live feed!' : 'Дархости нави таъмир дар чати глобалӣ пайдо шуд!');
    });

    const unsubClaimedBroadcast = registerListener('repair_ticket_claimed_broadcast', (data) => {
      setTickets(prev =>
        prev.map(t => (t.id === data.repair_id ? { ...t, status: 'in_progress' } : t))
      );
    });

    const unsubClaimedUser = registerListener('repair_ticket_claimed', (data) => {
      setTickets(prev =>
        prev.map(t => (t.id === data.repair_id ? { ...t, status: 'in_progress', usto_id: data.usto_id } : t))
      );
      toast.success(lang === 'en' ? 'A technician has claimed your repair ticket!' : 'Усто дархости таъмири шуморо қабул кард!');
    });

    return () => {
      unsubNewTicket();
      unsubClaimedBroadcast();
      unsubClaimedUser();
    };
  }, [user, registerListener, lang]);

  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const totalCost = activeServicesList
    .filter(item => selectedServices.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const installmentCost = Math.round(totalCost / 12 * 1.08);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(lang === 'en' ? 'Please log in to submit a request' : 'Лутфан барои фиристодани дархост ворид шавед');
      navigate('/login');
      return;
    }
    if (!name.trim()) {
      toast.error(lang === 'en' ? 'Please enter your name' : 'Лутфан номи худро ворид кунед');
      return;
    }
    if (phone.trim().length < 9) {
      toast.error(lang === 'en' ? 'Please enter a valid phone number' : 'Лутфан рақами телефони дурустро ворид кунед');
      return;
    }
    if (selectedServices.length === 0) {
      toast.error(lang === 'en' ? 'Please select at least one service' : 'Лутфан ақаллан як хидматро интихоб кунед');
      return;
    }

    setIsSubmitting(true);

    const serviceLabels = activeServicesList
      .filter(selectedServices.includes.bind(selectedServices))
      .map(item => item.label[lang])
      .join(', ');

    const fullDescription = `[Device: ${deviceType.toUpperCase()}] Services: ${serviceLabels}. Details: ${description}`;

    try {
      await apiClient.post('/repairs/', {
        name,
        phone,
        device_type: deviceType,
        service_type: 'repair',
        description: fullDescription,
        estimated_cost: totalCost
      });
      
      toast.success(lang === 'en' ? 'Repair request sent to global feed!' : 'Дархости таъмир ба чати глобалӣ фиристода шуд!');
      
      // Reset form
      setSelectedServices([]);
      setDescription('');
    } catch (err) {
      console.error(err);
      toast.error(lang === 'en' ? 'Failed to submit repair request' : 'Хатогӣ дар фиристодани дархост');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimTicket = async (ticketId: number) => {
    setClaimBusyId(ticketId);
    try {
      const response = await apiClient.post<RepairTicket>(`/repairs/${ticketId}/claim`);
      toast.success(lang === 'en' ? 'Job claimed successfully!' : 'Дархост бомуваффақият қабул шуд!');
      setTickets(prev =>
        prev.map(t => (t.id === ticketId ? response.data : t))
      );
    } catch {
      toast.error(lang === 'en' ? 'Failed to claim ticket' : 'Хатогӣ дар қабули дархост');
    } finally {
      setClaimBusyId(null);
    }
  };

  return (
    <div className="repair-feed-page scroll-reveal">
      <div className="repair-feed-header">
        <h1 className="feed-title">
          <Wrench className="title-icon animate-wrench" />
          <span>{lang === 'tj' ? 'Чат ва Фармоишҳои Таъмир' : lang === 'ru' ? 'Чат и Заказы на Ремонт' : 'Repair Chat & Requests Board'}</span>
        </h1>
        <p className="feed-subtitle">
          {lang === 'tj'
            ? 'Дархости худро ба чати глобалии таъмир фиристед ва устоҳо бо шумо дар вақти воқеӣ чат мекунанд.'
            : lang === 'ru'
            ? 'Отправьте заявку в глобальный чат ремонта, и мастера свяжутся с вами в реальном времени.'
            : 'Send your repair requests into the global live feed, and professional technicians will claim and chat with you instantly.'}
        </p>
      </div>

      <div className="repair-feed-grid">
        {/* Left Side: Live Chat Feed of Repair Tickets */}
        <div className="feed-chat-container">
          <div className="feed-chat-header-bar">
            <span className="live-pulse-dot" />
            <h3>{lang === 'en' ? 'Live Global Feed' : 'Чати Мустақими Глобалӣ'}</h3>
            <span className="feed-badge">{tickets.length} {lang === 'en' ? 'Requests' : 'Дархост'}</span>
          </div>

          <div className="feed-messages-list">
            {!user ? (
              <div className="feed-empty-state">
                <ShieldCheck size={36} className="empty-icon" />
                <p>{lang === 'en' ? 'Please log in to view active repair requests' : 'Лутфан, барои дидани дархостҳо ворид шавед.'}</p>
                <button className="auth-btn-feed" onClick={() => navigate('/login')}>{lang === 'en' ? 'Log In' : 'Воридшавӣ'}</button>
              </div>
            ) : loadingFeed ? (
              <div className="feed-loading-state">
                <Loader className="spin-icon" size={24} />
                <p>{lang === 'en' ? 'Connecting to live board...' : 'Пайвастшавӣ ба сервери чат...'}</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="feed-empty-state">
                <Clock size={36} className="empty-icon" />
                <p>
                  {user.role === 'usto'
                    ? (lang === 'en' ? 'No repair requests available to claim.' : 'Ҳеҷ дархости таъмир барои қабул нест.')
                    : (lang === 'en' ? 'You have not submitted any repair requests. Use the form to submit!' : 'Шумо ягон дархост нафиристодаед. Аз формаи рост истифода баред!')}
                </p>
              </div>
            ) : (
              tickets.map(ticket => {
                const isOwner = ticket.client_id === user.id;
                const isClaimed = ticket.usto_id !== null;
                const isAssignedToMe = ticket.usto_id === user.id;
                const canClaim = user.role === 'usto' && !isClaimed;

                return (
                  <div key={ticket.id} className={`feed-chat-bubble ${isOwner ? 'mine' : ''} ${isClaimed ? 'claimed' : 'pending'}`}>
                    <div className="bubble-user-info">
                      <div className="user-icon-wrap">
                        {ticket.device_type === 'phone' ? <Smartphone size={15} /> : <Laptop size={15} />}
                      </div>
                      <span className="bubble-username">{ticket.name}</span>
                      <span className="bubble-ticket-id">#{ticket.id}</span>
                      <span className="bubble-timestamp">
                        {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="bubble-content">
                      <p className="bubble-desc">{ticket.description}</p>
                      <div className="bubble-meta">
                        <span className="bubble-price">{ticket.estimated_cost} TJS</span>
                        <span className={`status-tag ${ticket.status}`}>
                          {ticket.status === 'pending' ? (lang === 'en' ? 'Pending' : 'Дартизор') : (lang === 'en' ? 'In Progress' : 'Дар ҳоли таъмир')}
                        </span>
                      </div>
                    </div>

                    <div className="bubble-actions">
                      {/* Technician Actions */}
                      {canClaim && (
                        <button
                          type="button"
                          className="claim-action-btn"
                          onClick={() => handleClaimTicket(ticket.id)}
                          disabled={claimBusyId === ticket.id}
                        >
                          {claimBusyId === ticket.id ? <Loader className="spin-icon" size={12} /> : <Play size={12} />}
                          <span>{lang === 'en' ? 'Claim Request' : 'Қабули Кор'}</span>
                        </button>
                      )}

                      {/* Chat room buttons */}
                      {isClaimed && (isOwner || isAssignedToMe || user.is_admin) && (
                        <button
                          type="button"
                          className="chat-action-btn"
                          onClick={() => setActiveChatTicket(ticket)}
                        >
                          <MessageSquare size={13} />
                          <span>{lang === 'en' ? 'Open Chat' : 'Чат кардан'}</span>
                        </button>
                      )}

                      {isClaimed && !isOwner && !isAssignedToMe && !user.is_admin && (
                        <span className="claimed-by-other-tag">
                          {lang === 'en' ? 'Claimed by technician' : 'Аллакай қабул шудааст'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Calculator Submission Form */}
        <div className="feed-form-container">
          <div className="form-card-wrapper">
            <div className="form-header-bar">
              <Sparkles size={16} className="spark-icon" />
              <h3>{lang === 'en' ? 'Build Repair Request' : 'Дархости Нави Таъмир'}</h3>
            </div>

            {/* Device Selector */}
            <div className="feed-device-selector">
              <button
                type="button"
                className={`dev-selector-btn ${deviceType === 'laptop' ? 'active' : ''}`}
                onClick={() => { setDeviceType('laptop'); setSelectedServices([]); }}
              >
                <Laptop size={16} />
                <span>{lang === 'en' ? 'Laptop' : 'Ноутбук'}</span>
              </button>
              <button
                type="button"
                className={`dev-selector-btn ${deviceType === 'phone' ? 'active' : ''}`}
                onClick={() => { setDeviceType('phone'); setSelectedServices([]); }}
              >
                <Smartphone size={16} />
                <span>{lang === 'en' ? 'Phone' : 'Телефон'}</span>
              </button>
            </div>

            {/* Services Checklist */}
            <div className="feed-services-checklist">
              <label className="checklist-heading">{lang === 'en' ? 'Select Services' : 'Интихоби хидматҳо'}</label>
              <div className="checklist-items-scroll">
                {activeServicesList.map(item => {
                  const isChecked = selectedServices.includes(item.id);
                  return (
                    <label key={item.id} className={`checklist-item-row ${isChecked ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleService(item.id)}
                        style={{ display: 'none' }}
                      />
                      <div className="checkbox-box">
                        {isChecked && <Check size={10} strokeWidth={3} />}
                      </div>
                      <span className="item-label-text">{item.label[lang]}</span>
                      <span className="item-price-tag">{item.price} TJS</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="feed-price-estimate">
              <div className="estimate-row">
                <span>{lang === 'en' ? 'Est. Total:' : 'Нархи тахминӣ:'}</span>
                <span className="price-bold">{totalCost} TJS</span>
              </div>
              {totalCost > 0 && (
                <div className="estimate-subrow">
                  <ShieldCheck size={12} className="shield-icon" />
                  <span>
                    {lang === 'tj'
                      ? `Аз ${installmentCost} TJS/моҳ бо Alif Salom`
                      : `From ${installmentCost} TJS/month with Alif`}
                  </span>
                </div>
              )}
            </div>

            {/* Contact details */}
            <form onSubmit={handleSubmit} className="feed-details-form">
              <div className="input-group-feed">
                <label>{lang === 'en' ? 'Name' : 'Номи Шумо'} *</label>
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Your name...' : 'Номатон...'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group-feed">
                <label>{lang === 'en' ? 'Phone Number' : 'Рақами телефон'} *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+992 90 123 4567"
                  required
                />
              </div>

              <div className="input-group-feed">
                <label>{lang === 'en' ? 'Problem Details (Optional)' : 'Тавсифи мушкилӣ (Иловагӣ)'}</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={lang === 'en' ? 'Describe screen issues, overheating, slow performance...' : 'Тавсифи кӯтоҳ...'}
                />
              </div>

              <button type="submit" className="submit-repair-btn-feed" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={14} />
                    <span>{lang === 'en' ? 'Sending...' : 'Дархост фиристода мешавад...'}</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>{lang === 'en' ? 'Post to Global Chat' : 'Фиристодан ба Чати Глобалӣ'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {activeChatTicket && (
        <RepairChatWindow
          repairId={activeChatTicket.id}
          clientName={activeChatTicket.name}
          clientPhone={activeChatTicket.phone}
          deviceType={activeChatTicket.device_type}
          estimatedCost={activeChatTicket.estimated_cost}
          onClose={() => {
            setActiveChatTicket(null);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
};
