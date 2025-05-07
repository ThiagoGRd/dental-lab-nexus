
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '@/types/notification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock initial notifications - will be replaced with real data from Supabase
const initialNotifications: Notification[] = [
  { 
    id: 1, 
    title: 'Ordem Urgente', 
    message: 'Nova ordem urgente adicionada (#ORD045)', 
    time: '10 min',
    type: 'order', 
    priority: 'high',
    read: false,
    createdAt: new Date().toISOString(),
    link: '/orders',
    actionText: 'Ver ordem'
  },
  { 
    id: 2, 
    title: 'Prazo Próximo', 
    message: 'A ordem #ORD033 vence em 24 horas', 
    time: '1 hora',
    type: 'deadline', 
    priority: 'medium',
    read: false,
    createdAt: new Date().toISOString(),
    link: '/orders'
  },
  { 
    id: 3, 
    title: 'Material em Falta', 
    message: 'Estoque baixo de Resina Z350', 
    time: '2 horas',
    type: 'inventory', 
    priority: 'medium',
    read: false,
    createdAt: new Date().toISOString(),
    link: '/inventory'
  },
  { 
    id: 4, 
    title: 'Pagamento Recebido', 
    message: 'Pagamento da Clínica Dental Care confirmado', 
    time: '5 horas',
    type: 'payment', 
    priority: 'low',
    read: true,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  { 
    id: 5, 
    title: 'Ordem Concluída', 
    message: 'Ordem #ORD028 foi finalizada', 
    time: '1 dia',
    type: 'order', 
    priority: 'low',
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
];

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number | string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number | string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const { toast } = useToast();

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark a notification as read
  const markAsRead = (id: number | string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    // In a real app, update the database
    // updateNotificationStatus(id, true);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // In a real app, update all notifications
    // updateAllNotificationsStatus(true);
  };

  // Delete a notification
  const deleteNotification = (id: number | string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // In a real app, delete from database
    // deleteNotificationFromDB(id);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    // In a real app, clear all notifications
    // clearAllNotificationsFromDB();
  };

  // Set up real-time notifications with Supabase (simulation for now)
  useEffect(() => {
    // Simulate a new notification coming in after 10 seconds
    const timer = setTimeout(() => {
      const newNotification: Notification = {
        id: Date.now(),
        title: 'Nova Atualização',
        message: 'O sistema foi atualizado com novos recursos',
        type: 'system',
        priority: 'low',
        time: 'agora',
        read: false,
        createdAt: new Date().toISOString(),
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Show toast notification
      toast({
        title: newNotification.title,
        description: newNotification.message,
        variant: "default",
      });
    }, 10000);

    // For a real implementation, we would set up a Supabase subscription
    // const channel = supabase.channel('public:notifications')
    //   .on('postgres_changes', { 
    //     event: 'INSERT', 
    //     schema: 'public', 
    //     table: 'notifications',
    //     filter: `user_id=eq.${userId}`
    //   }, (payload) => {
    //     // Handle new notification
    //     const newNotification = payload.new as Notification;
    //     setNotifications(prev => [newNotification, ...prev]);
    //     
    //     // Show toast notification
    //     toast({
    //       title: newNotification.title,
    //       description: newNotification.message,
    //     });
    //   })
    //   .subscribe();
    
    // Return a cleanup function
    return () => {
      clearTimeout(timer);
      // In a real app: supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      deleteNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
