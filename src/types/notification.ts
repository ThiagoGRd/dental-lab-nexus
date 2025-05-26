
export type NotificationType = 'order' | 'deadline' | 'inventory' | 'payment' | 'system' | 'due-date';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: number | string;
  title: string;
  message: string;
  description?: string; // Adicionando propriedade description
  type: NotificationType;
  priority?: NotificationPriority;
  time: string;
  date: string; // Adicionando propriedade date
  read: boolean;
  createdAt: string;
  link?: string;
  actionText?: string;
}
