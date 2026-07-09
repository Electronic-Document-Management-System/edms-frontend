import { apiClient } from "@/lib/api-client";
import { Notification, NotificationsResponse } from "./notification.types";

export const getNotifications = async (page = 1, limit = 10): Promise<NotificationsResponse> => {
  const res = await apiClient<{ data: NotificationsResponse }>(
    `/notification?page=${page}&limit=${limit}`
  );
  return res.data;
};

export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  const res = await apiClient<{ data: Notification }>(
    `/notification/${notificationId}/read`,
    { method: "POST" }
  );
  return res.data;
};

export const markAllNotificationsAsRead = async (): Promise<number> => {
  const res = await apiClient<{ data: { count: number } }>(
    `/notification/read-all`,
    { method: "POST" }
  );
  return res.data.count;
};

export const deleteNotification = async (notificationId: number): Promise<void> => {
  await apiClient<{ data: { id: number } }>(
    `/notification/${notificationId}`,
    { method: "DELETE" }
  );
};

export const deleteAllNotifications = async (): Promise<number> => {
  const res = await apiClient<{ data: { count: number } }>(
    `/notification/delete-all`,
    { method: "POST" }
  );
  return res.data.count;
};