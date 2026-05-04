import { create } from "zustand";
import type { Notification } from "@/types/api";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter((n) => !n.is_read).length }),
  addNotification: (notification) => {
    const all = [notification, ...get().notifications];
    set({ notifications: all, unreadCount: all.filter((n) => !n.is_read).length });
  },
  markRead: (id) => {
    const updated = get().notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    set({ notifications: updated, unreadCount: updated.filter((n) => !n.is_read).length });
  },
  markAllRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, is_read: true }));
    set({ notifications: updated, unreadCount: 0 });
  },
}));
