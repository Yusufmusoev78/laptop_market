import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationsContext';
import { RepairChatWindow } from '../components/ui/RepairChatWindow';
import { Wrench, Clock, Phone, CheckCircle, MessageSquare, PlusCircle, Play, ShieldAlert, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile } from '../api/auth';
import './UstoDashboard.css';

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

export const UstoDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { lang } = useLang();
  const { registerListener } = useNotifications();
  const navigate = useNavigate();

  const [activeJobs, setActiveJobs] = useState<RepairTicket[]>([]);
  const [unclaimedJobs, setUnclaimedJobs] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusyId, setActionBusyId] = useState<number | null>(null);

  // Active chat state
  const [activeChatTicket, setActiveChatTicket] = useState<RepairTicket | null>(null);

  // Load dashboards data
  const loadDashboardData = async () => {
    if (!user || user.role !== 'usto') return;
    try {
      setLoading(true);
      // Fetch claimed active jobs
      const resActive = await apiClient.get<RepairTicket[]>('/repairs/');
      setActiveJobs(resActive.data);

      // Fetch unclaimed pending jobs
      const resUnclaimed = await apiClient.get<RepairTicket[]>('/repairs/?unclaimed=true');
      setUnclaimedJobs(resUnclaimed.data);
    } catch (err) {
      console.error('Failed to load usto dashboard:', err);
      toast.error(lang === 'en' ? 'Failed to fetch tickets' : 'Хатогӣ дар боркунии маълумот');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'usto') return;

    const unsubNewTicket = registerListener('new_repair_ticket', (data) => {
      setUnclaimedJobs(prev => {
        if (prev.some(t => t.id === data.ticket.id)) return prev;
        return [data.ticket, ...prev];
      });
      toast.success(lang === 'en' ? 'New repair ticket available!' : 'Дархости нави таъмир пайдо шуд!');
    });

    const unsubClaimedBroadcast = registerListener('repair_ticket_claimed_broadcast', (data) => {
      setUnclaimedJobs(prev => prev.filter(t => t.id !== data.repair_id));
    });

    return () => {
      unsubNewTicket();
      unsubClaimedBroadcast();
    };
  }, [user, registerListener, lang]);

  // Claim a ticket
  const handleClaimTicket = async (ticketId: number) => {
    setActionBusyId(ticketId);
    try {
      const response = await apiClient.post<RepairTicket>(`/repairs/${ticketId}/claim`);
      toast.success(lang === 'en' ? 'Ticket claimed successfully!' : 'Чипта бомуваффақият қабул шуд!');
      // Update local state lists
      setUnclaimedJobs(prev => prev.filter(t => t.id !== ticketId));
      setActiveJobs(prev => [response.data, ...prev]);
    } catch {
      toast.error(lang === 'en' ? 'Failed to claim ticket' : 'Хатогӣ дар қабули чипта');
    } finally {
      setActionBusyId(null);
    }
  };

  // Convert client profile to Usto
  const handleBecomeUsto = async () => {
    try {
      setLoading(true);
      await updateProfile({ role: 'usto' });
      await refreshUser();
      toast.success(lang === 'en' ? 'Welcome to Usto Team!' : 'Ба дастаи Устоҳо хуш омадед!');
    } catch {
      toast.error(lang === 'en' ? 'Failed to update account role' : 'Хатогӣ дар навсозии нақш');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="usto-dashboard-page-empty">
        <ShieldAlert size={48} className="warn-icon" />
        <h2>{lang === 'en' ? 'Access Denied' : 'Дастрасӣ маҳдуд аст'}</h2>
        <p>{lang === 'en' ? 'Please log in to access this page.' : 'Лутфан, барои ворид шудан ба ин саҳифа ворид шавед.'}</p>
        <button onClick={() => navigate('/login')} className="usto-btn-primary">
          {lang === 'en' ? 'Log In' : 'Воридшавӣ'}
        </button>
      </div>
    );
  }

  // If user is not an usto, show invitation screen to become one!
  if (user.role !== 'usto') {
    return (
      <div className="usto-dashboard-onboarding scroll-reveal">
        <div className="onboarding-card">
          <Wrench size={48} className="onboarding-icon" />
          <h2>{lang === 'tj' ? 'Оё шумо Усто (Таъмиркор) ҳастед?' : lang === 'ru' ? 'Вы мастер по ремонту?' : 'Are you a Repair Master?'}</h2>
          <p className="onboarding-desc">
            {lang === 'tj'
              ? 'Ба дастаи устоҳои Somon Comp ҳамроҳ шавед. Шумо метавонед дархостҳои муштариёнро қабул кунед, бо онҳо чат кунед ва дастгоҳҳои ноутбук ё телефонро таъмир кунед.'
              : lang === 'ru'
              ? 'Присоединяйтесь к технической команде мастеров Somon Comp. Вы сможете принимать заявки, общаться с клиентами и ремонтировать технику.'
              : 'Join the Somon Comp technical repair team. You can claim client tickets, text them directly in live chatrooms, and repair laptops or mobile phones.'}
          </p>
          <div className="onboarding-features-list">
            <div className="feat-row">
              <CheckCircle size={16} className="feat-check" />
              <span>{lang === 'en' ? 'View pending repair tickets board' : 'Дастрасӣ ба рӯйхати дархостҳои нав'}</span>
            </div>
            <div className="feat-row">
              <CheckCircle size={16} className="feat-check" />
              <span>{lang === 'en' ? 'Direct customer chat messaging' : 'Чат ва гуфтугӯи мустақим бо муштариён'}</span>
            </div>
            <div className="feat-row">
              <CheckCircle size={16} className="feat-check" />
              <span>{lang === 'en' ? 'Manage service prices and status logs' : 'Идоракунии нархҳо ва вазъияти таъмир'}</span>
            </div>
          </div>
          <button onClick={handleBecomeUsto} className="usto-btn-primary" disabled={loading}>
            {loading ? <Loader className="spin-icon" size={16} /> : null}
            {lang === 'tj' ? 'Ҳамчун Усто сабт шудан' : lang === 'ru' ? 'Стать Мастером (Усто)' : 'Become a Repair Master'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="usto-dashboard-page scroll-reveal">
      <div className="usto-dashboard-header">
        <div>
          <h1>{lang === 'tj' ? 'Паннели Идораи Усто' : lang === 'ru' ? 'Кабинет Мастера' : 'Usto Master Dashboard'}</h1>
          <p>{lang === 'en' ? 'Manage repairs, claim jobs, and chat with customers.' : 'Дархостҳои таъмирро қабул кунед ва бо муштариён чат кунед.'}</p>
        </div>
        <div className="usto-badge-status">
          <span className="status-dot green" />
          <span>{lang === 'en' ? 'Technician Active' : 'Усто фаъол аст'}</span>
        </div>
      </div>

      <div className="usto-dashboard-grid">
        {/* Left Side: Claimed Active Jobs */}
        <div className="dashboard-section active-jobs-section">
          <h2 className="section-title">
            <Wrench size={18} className="title-icon" />
            {lang === 'en' ? 'My Claimed Jobs' : 'Дастгоҳҳо дар таъмир'}
            <span className="count-badge">{activeJobs.length}</span>
          </h2>

          {loading ? (
            <div className="list-loading-placeholder">
              <Loader className="spin-icon" />
              <span>{lang === 'en' ? 'Loading tickets...' : 'Боркунии рӯйхат...'}</span>
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="list-empty-placeholder">
              <Clock size={32} />
              <p>{lang === 'en' ? 'No active jobs claimed yet.' : 'Рӯйхати таъмир холӣ аст.'}</p>
            </div>
          ) : (
            <div className="tickets-list">
              {activeJobs.map(ticket => (
                <div key={ticket.id} className="ticket-card active-job">
                  <div className="ticket-card-header">
                    <span className="ticket-id">#{ticket.id}</span>
                    <span className={`status-pill ${ticket.status}`}>{ticket.status}</span>
                  </div>

                  <h3 className="client-name">{ticket.name}</h3>
                  <p className="client-phone"><Phone size={12} className="inline-icon" /> {ticket.phone}</p>
                  
                  <div className="device-spec-tag">
                    <span className="capitalize">{ticket.device_type}</span>
                  </div>

                  <p className="ticket-desc">{ticket.description}</p>

                  <div className="ticket-card-footer">
                    <span className="cost-label">{ticket.estimated_cost} TJS</span>
                    <button
                      type="button"
                      className="chat-open-btn"
                      onClick={() => setActiveChatTicket(ticket)}
                    >
                      <MessageSquare size={14} style={{ marginRight: '6px' }} />
                      {lang === 'en' ? 'Open Chat' : 'Чат бо муштарӣ'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Unclaimed Jobs Board */}
        <div className="dashboard-section unclaimed-board-section">
          <h2 className="section-title">
            <PlusCircle size={18} className="title-icon text-primary" />
            {lang === 'en' ? 'Available Repair Jobs' : 'Дархостҳои нави таъмир'}
            <span className="count-badge blue">{unclaimedJobs.length}</span>
          </h2>

          {loading ? (
            <div className="list-loading-placeholder">
              <Loader className="spin-icon" />
              <span>{lang === 'en' ? 'Loading board...' : 'Боркунии дархостҳо...'}</span>
            </div>
          ) : unclaimedJobs.length === 0 ? (
            <div className="list-empty-placeholder">
              <CheckCircle size={32} className="text-primary" />
              <p>{lang === 'en' ? 'All repair tickets have been claimed!' : 'Ҳамаи дархостҳо қабул шудаанд!'}</p>
            </div>
          ) : (
            <div className="tickets-list">
              {unclaimedJobs.map(ticket => (
                <div key={ticket.id} className="ticket-card unclaimed-job">
                  <div className="ticket-card-header">
                    <span className="ticket-id">#{ticket.id}</span>
                    <span className="status-pill pending">{lang === 'en' ? 'Unclaimed' : 'Нав'}</span>
                  </div>

                  <h3 className="client-name">{ticket.name}</h3>
                  <p className="client-phone"><Phone size={12} className="inline-icon" /> {ticket.phone}</p>

                  <div className="device-spec-tag">
                    <span className="capitalize">{ticket.device_type}</span>
                  </div>

                  <p className="ticket-desc">{ticket.description}</p>

                  <div className="ticket-card-footer">
                    <span className="cost-label">{ticket.estimated_cost} TJS</span>
                    <button
                      type="button"
                      className="claim-btn"
                      onClick={() => handleClaimTicket(ticket.id)}
                      disabled={actionBusyId === ticket.id}
                    >
                      {actionBusyId === ticket.id ? <Loader className="spin-icon" size={12} /> : <Play size={12} style={{ marginRight: '6px' }} />}
                      {lang === 'en' ? 'Claim Job' : 'Қабули дархост'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render Chatoverlay dialog */}
      {activeChatTicket && (
        <RepairChatWindow
          repairId={activeChatTicket.id}
          clientName={activeChatTicket.name}
          clientPhone={activeChatTicket.phone}
          deviceType={activeChatTicket.device_type}
          estimatedCost={activeChatTicket.estimated_cost}
          onClose={() => {
            setActiveChatTicket(null);
            loadDashboardData(); // Reload status in dashboard if changed in chat
          }}
        />
      )}
    </div>
  );
};
