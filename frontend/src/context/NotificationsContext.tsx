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
  registerListener: (type: string, callback: (data: any) => void) => () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  registerListener: () => () => {},
});

const wsBaseUrl = (apiClient.defaults.baseURL ?? 'http://localhost:8000/api/v1').replace(/^http/, 'ws');

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  // Registry of WebSocket message type listeners
  const listenersRef = useRef<Record<string, Set<(data: any) => void>>>({});

  const registerListener = useCallback((type: string, callback: (data: any) => void) => {
    if (!listenersRef.current[type]) {
      listenersRef.current[type] = new Set();
    }
    listenersRef.current[type].add(callback);

    // Return cleanup unsubscribe function
    return () => {
      listenersRef.current[type]?.delete(callback);
      if (listenersRef.current[type]?.size === 0) {
        delete listenersRef.current[type];
      }
    };
  }, []);

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

        // Dispatch to registered type-specific listeners
        if (data.type) {
          const callbacks = listenersRef.current[data.type];
          if (callbacks) {
            callbacks.forEach(cb => {
              try { cb(data); } catch (e) { console.error('Error in WS callback:', e); }
            });
          }
        }

        // Standard notification handling
        if (data.message) {
          const notification: AppNotification = {
            id: `${Date.now()}-${Math.random()}`,
            type: data.type,
            message: data.message,
            receivedAt: Date.now(),
          };
          setNotifications(prev => [notification, ...prev].slice(0, 20));
          setUnreadCount(c => c + 1);
          toast(data.message);
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [isAuthenticated]);

  const markAllRead = useCallback(() => setUnreadCount(0), []);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, registerListener }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
