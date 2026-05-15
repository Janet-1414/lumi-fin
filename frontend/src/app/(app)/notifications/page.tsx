"use client";
import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useNotificationStore } from "@/store/notificationStore";
import { markRead, markAllRead } from "@/lib/notifications";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/types/api";
import { clsx } from "clsx";

const TYPE_ICONS: Record<string, string> = {
  spending_alert: "⚠️",
  savings_milestone: "🎯",
  streak_reminder: "🔥",
  goal_achieved: "🏆",
  weekly_report: "📊",
  community_pulse: "🌍",
  investment_hint: "💡",
  literacy_lesson: "📚",
  challenge_update: "💪",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { markRead: markReadStore, markAllRead: markAllReadStore } = useNotificationStore();

  useEffect(() => {
    api.get<Notification[]>("/notifications")
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    await markRead(id);
    markReadStore(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    markAllReadStore();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-mg-alert text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={handleMarkAllRead}>
            <CheckCheck size={14} />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : notifications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--text-primary)]">No notifications yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Lumi will notify you about spending alerts, savings milestones, and AI insights
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={clsx(
                "flex items-start gap-3 p-4 rounded-card border transition-all",
                n.is_read
                  ? "bg-[var(--bg-card)] border-[var(--border)]"
                  : "bg-mg-gold/5 border-mg-gold/30"
              )}
            >
              <span className="text-xl flex-shrink-0">{TYPE_ICONS[n.type] || "🔔"}</span>
              <div className="flex-1 min-w-0">
                <p className={clsx("text-sm font-semibold", n.is_read ? "text-[var(--text-primary)]" : "text-mg-gold")}>
                  {n.title}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-[var(--text-muted)] hover:text-mg-gold transition-colors flex-shrink-0"
                  title="Mark as read"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
