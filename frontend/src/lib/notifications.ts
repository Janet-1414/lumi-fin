import { api } from "./api";
import type { Notification } from "@/types/api";

export async function getNotifications(unreadOnly = false): Promise<Notification[]> {
  return api.get<Notification[]>("/notifications", { unread_only: unreadOnly });
}

export async function markRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}
