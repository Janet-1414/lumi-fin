"use client";
import { Bell, Zap, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useNotificationStore } from "@/store/notificationStore";
import Avatar from "@/components/ui/Avatar";
import { useEffect } from "react";
import { getNotifications } from "@/lib/notifications";

export default function TopBar() {
  const user = useUser();
  const { unreadCount, setNotifications } = useNotificationStore();

  useEffect(() => {
    getNotifications().then(setNotifications).catch(() => {});
  }, []);

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-mg-gold flex items-center justify-center">
          <Zap size={16} className="text-mg-bg" fill="currentColor" />
        </div>
        <span className="text-lg font-bold gradient-text">Lumi</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/chat" className="text-[var(--text-muted)] hover:text-mg-gold transition-colors">
          <MessageCircle size={20} />
        </Link>
        <Link href="/notifications" className="relative text-[var(--text-muted)] hover:text-mg-gold transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-mg-alert text-white text-[9px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/profile">
          {user && <Avatar name={`${user.first_name} ${user.last_name}`} size="sm" />}
        </Link>
      </div>
    </header>
  );
}