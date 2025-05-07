
export type NotificationType = 'order' | 'deadline' | 'inventory' | 'payment' | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: number | string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  time: string;
  read: boolean;
  createdAt: string;
  link?: string;
  actionText?: string;
}
