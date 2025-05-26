
export type NotificationType = 'order' | 'deadline' | 'inventory' | 'payment' | 'system' | 'due-date';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: number | string;
  title: string;
  message: string;
  description: string;
  type: NotificationType;
  priority?: NotificationPriority;
  time: string;
  date: string;
  read: boolean;
  createdAt: string;
  link?: string;
  actionText?: string;
}
