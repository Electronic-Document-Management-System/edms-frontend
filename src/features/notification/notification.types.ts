export type Notification = {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  resource: string;
  resourceId: number;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
};