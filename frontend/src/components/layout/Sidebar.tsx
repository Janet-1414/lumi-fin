"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ArrowLeftRight, Target, BarChart3,
  Users, MessageCircle, User, Zap, LogOut, Bell,
} from "lucide-react";
import { clsx } from "clsx";
import { useUser } from "@/hooks/useUser";
import { logout } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getNotifications } from "@/lib/notifications";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/savings", icon: Target, label: "Savings" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/chat", icon: MessageCircle, label: "AI Chat" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useUser();
  const { clearAuth } = useAuthStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    getNotifications().then(setNotifications).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    clearAuth();
    router.push("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 border-r border-[var(--border)] bg-[var(--bg-secondary)] z-30 py-6 px-4">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-mg-gold flex items-center justify-center shadow-gold-glow-sm">
          <Zap size={18} className="text-mg-bg" fill="currentColor" />
        </div>
        <span className="text-xl font-bold gradient-text">Lumi</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const isNotif = href === "/notifications";
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-all duration-150",
                active
                  ? "bg-mg-gold/10 text-mg-gold border border-mg-gold/20 shadow-gold-glow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
              )}
            >
              <div className="relative">
                <Icon size={18} />
                {isNotif && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-mg-alert text-white text-[8px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 mt-4">
        {user?.subscription_tier === "free" && (
          <Link
            href="/subscription"
            className="flex items-center gap-2 px-3 py-2.5 rounded-card bg-mg-gold/10 border border-mg-gold/30 text-mg-gold text-sm font-medium hover:bg-mg-gold/20 transition-all"
          >
            <Zap size={16} fill="currentColor" />
            Upgrade to Pro
          </Link>
        )}
        <div className="flex items-center justify-between px-2 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-mg-gold/20 border border-mg-gold/30 flex items-center justify-center text-xs font-semibold text-mg-gold flex-shrink-0">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.first_name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{user?.currency_code}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-[var(--text-muted)] hover:text-mg-alert transition-colors flex-shrink-0">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
