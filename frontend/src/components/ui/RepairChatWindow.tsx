import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/client';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Send, Clock, User, X, MessageSquare, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import './RepairChatWindow.css';

interface Message {
  id: number;
  repair_id: number;
  sender_id: number;
  sender_name: string;
  message_text: string;
  created_at: string;
}

interface RepairChatWindowProps {
  repairId: number;
  clientName: string;
  clientPhone: string;
  deviceType: string;
  estimatedCost: number;
  onClose: () => void;
}

export const RepairChatWindow: React.FC<RepairChatWindowProps> = ({
  repairId,
  clientName,
  clientPhone,
  deviceType,
  estimatedCost,
  onClose
}) => {
  const { user } = useAuth();
  const { lang } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const isUsto = user?.role === 'usto';

  // Load message history
  const loadMessages = async () => {
    try {
      const response = await apiClient.get<Message[]>(`/repairs/${repairId}/messages`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [repairId]);

  // Scroll to bottom on load or message update
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || inputText.trim();
    if (!textToSend) return;

    setSending(true);
    try {
      const response = await apiClient.post<Message>(`/repairs/${repairId}/messages`, {
        message_text: textToSend
      });
      setMessages(prev => [...prev, response.data]);
      if (!textOverride) setInputText('');
    } catch {
      toast.error(lang === 'en' ? 'Failed to send message' : 'Хатогӣ дар фиристодан');
    } finally {
      setSending(false);
    }
  };

  // Usto fast response templates
  const templates = {
    tj: [
      { label: 'Ташхис шуд', text: 'Салом! Ташхиси дастгоҳ ба охир расид. Мушкилиро муайян кардем.' },
      { label: 'Дастгоҳ омода', text: 'Корҳои таъмир омода шуданд! Шумо метавонед дастгоҳи худро қабул кунед.' },
      { label: 'Қисми нав лозим', text: 'Барои таъмир қисми эҳтиётии нав лозим аст. Фармоиш медиҳем, 1-2 рӯз лозим аст.' }
    ],
    ru: [
      { label: 'Диагностика', text: 'Приветствуем! Диагностика завершена. Неисправность успешно найдена.' },
      { label: 'Готово', text: 'Ремонтные работы успешно завершены! Вы можете забрать свое устройство.' },
      { label: 'Нужна деталь', text: 'Для завершения требуется новая запчасть. Заказываем детали, займет 1-2 дня.' }
    ],
    en: [
      { label: 'Diagnostic Done', text: 'Hello! The diagnostic is completed. We have successfully found the issue.' },
      { label: 'Ready for Pickup', text: 'Repair works are successfully completed! Your device is ready for pickup.' },
      { label: 'Parts Needed', text: 'A new replacement part is required. Order placed, it will take 1-2 days.' }
    ]
  };

  const currentTemplates = templates[lang as keyof typeof templates] || templates.en;

  return (
    <div className="repair-chat-overlay scroll-reveal">
      <div className="repair-chat-container">
        {/* Chat Header */}
        <div className="repair-chat-header">
          <div className="chat-header-info">
            <Wrench className="header-icon" size={20} />
            <div>
              <h3>{lang === 'en' ? `Repair ticket #${repairId}` : `Рақами чипта #${repairId}`}</h3>
              <p>
                <User size={12} className="inline-icon" /> {clientName} ({clientPhone}) &bull;{' '}
                <strong className="capitalize">{deviceType}</strong>
              </p>
            </div>
          </div>
          <button type="button" className="chat-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Device summary info bar */}
        <div className="repair-chat-summary-bar">
          <span>{lang === 'en' ? 'Estimated cost:' : 'Нархи тахминӣ:'} <strong>{estimatedCost} TJS</strong></span>
          <span className="badge-live-chat">
            <span className="live-dot" /> {lang === 'en' ? 'Live Chat Room' : 'Чат бо усто'}
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="repair-chat-messages" ref={chatBodyRef}>
          {loading && messages.length === 0 ? (
            <div className="chat-loading-placeholder">
              <Clock className="spin-icon" />
              <p>{lang === 'en' ? 'Loading message history...' : 'Боркунии таърихи чат...'}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-placeholder">
              <MessageSquare size={32} />
              <p>{lang === 'en' ? 'No messages yet. Send a message to start discussion!' : 'Чат холӣ аст. Аввалин паёмро нависед!'}</p>
            </div>
          ) : (
            messages.map(msg => {
              const isOwnMessage = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`chat-message-row ${isOwnMessage ? 'own' : 'other'}`}>
                  <div className="message-sender-name">{msg.sender_name}</div>
                  <div className="message-bubble-content">
                    <p>{msg.message_text}</p>
                    <span className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Master templates panel */}
        {isUsto && (
          <div className="chat-templates-panel">
            <span className="templates-label">{lang === 'en' ? 'Templates:' : 'Шаблонҳо:'}</span>
            <div className="templates-list">
              {currentTemplates.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="template-chip"
                  onClick={() => handleSendMessage(undefined, t.text)}
                  disabled={sending}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input form */}
        <form className="repair-chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder={lang === 'en' ? 'Type your message...' : 'Паёми худро нависед...'}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={sending}
          />
          <button type="submit" className="chat-send-btn" disabled={!inputText.trim() || sending}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
