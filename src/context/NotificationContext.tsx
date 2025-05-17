
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { useOrdersByDueDate } from '@/hooks/useOrdersByDueDate';
import { NotificationType } from '@/types/notification';

interface Notification {
  id: string;
  content: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  orderId?: string;
  title?: string;
  message?: string;
  time?: string;
  priority?: string;
  actionText?: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (content: string, type: NotificationType, orderId?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  showNotificationDrawer: boolean;
  setShowNotificationDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  notificationsInitialized: boolean;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showNotifications: boolean;
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsInitialized, setNotificationsInitialized] = useState(false);
  const { dueOrders, loading: isLoadingOrders } = useOrdersByDueDate(5);

  // Sincronizar notificações com localStorage
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications).map((notification: any) => ({
          ...notification,
          createdAt: new Date(notification.createdAt)
        }));
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length);
      }
      setNotificationsInitialized(true);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotificationsInitialized(true);
    }
  }, []);

  // Salvar notificações em localStorage quando atualizadas
  useEffect(() => {
    if (notificationsInitialized && notifications.length > 0) {
      try {
        localStorage.setItem('notifications', JSON.stringify(notifications));
      } catch (error) {
        console.error('Erro ao salvar notificações:', error);
      }
    }
  }, [notifications, notificationsInitialized]);

  // Adicionar notificações de ordens com prazo próximo
  useEffect(() => {
    if (!isLoadingOrders && dueOrders && dueOrders.length > 0 && notificationsInitialized) {
      console.info('Adicionando notificações de ordens com prazo próximo:', dueOrders.length);

      // Verificar se já não temos notificações para essas ordens
      const newOrderNotifications = dueOrders.filter(order => {
        return !notifications.some(
          notification => 
            notification.orderId === order.id && 
            notification.type === 'due-date' &&
            // Apenas considerar notificações nas últimas 24 horas
            (new Date().getTime() - notification.createdAt.getTime() < 24 * 60 * 60 * 1000)
        );
      });

      if (newOrderNotifications.length > 0) {
        const newNotifications = newOrderNotifications.map(order => ({
          id: `order-${order.id}-${Date.now()}`,
          content: `A ordem #${order.id.substring(0, 8)} (${order.client}) vence em breve.`,
          type: 'due-date' as NotificationType,
          read: false,
          createdAt: new Date(),
          orderId: order.id
        }));

        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);

        // Mostrar toast para notificações de prazo
        if (newNotifications.length === 1) {
          toast(`Nova notificação: ${newNotifications[0].content}`);
        } else if (newNotifications.length > 1) {
          toast(`${newNotifications.length} novas notificações de ordens com prazo próximo`);
        }
      }
    }
  }, [dueOrders, isLoadingOrders, notificationsInitialized]);

  // Verificar se o usuário acabou de fazer login e mostrar notificações
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    
    if (justLoggedIn === 'true' && notificationsInitialized && unreadCount > 0) {
      console.info('Usuário acabou de fazer login, abrindo notificações');
      setShowNotificationDrawer(true);
      sessionStorage.removeItem('justLoggedIn');
    }
  }, [notificationsInitialized, unreadCount]);

  const addNotification = (content: string, type: NotificationType, orderId?: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      content,
      type,
      read: false,
      createdAt: new Date(),
      orderId
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Mostrar toast para notificação
    toast(`Nova notificação: ${content}`);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    // Recalcular contagem de não lidas
    setUnreadCount(prev => Math.max(prev - 1, 0));
  };

  const markAllAsRead = () => {
    if (notifications.some(n => !n.read)) {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      
      // Mostrar toast para todas marcadas como lidas
      toast(`Todas as notificações foram marcadas como lidas`);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    // Recalcular contagem de não lidas
    setUnreadCount(prev => 
      prev - (notifications.find(n => n.id === id && !n.read) ? 1 : 0)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    toast(`Todas as notificações foram removidas`);
  };

  // Valor do contexto
  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    showNotificationDrawer,
    setShowNotificationDrawer,
    notificationsInitialized,
    deleteNotification,
    clearAllNotifications,
    showNotifications,
    setShowNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
