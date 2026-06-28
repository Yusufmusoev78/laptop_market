import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  receivedAt: number;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
});

const wsBaseUrl = (apiClient.defaults.baseURL ?? 'http://localhost:8000/api/v1').replace(/^http/, 'ws');

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket(`${wsBaseUrl}/ws?token=${encodeURIComponent(token)}`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const notification: AppNotification = {
          id: `${Date.now()}-${Math.random()}`,
          type: data.type,
          message: data.message,
          receivedAt: Date.now(),
        };
        setNotifications(prev => [notification, ...prev].slice(0, 20));
        setUnreadCount(c => c + 1);
        toast(data.message);
      } catch {
        /* ignore malformed messages */
      }
    };
    wsRef.current = ws;
    return () => ws.close();
  }, [isAuthenticated]);

  const markAllRead = useCallback(() => setUnreadCount(0), []);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
