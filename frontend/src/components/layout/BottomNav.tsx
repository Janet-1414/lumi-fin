"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Target, Users, MessageCircle } from "lucide-react";
import { clsx } from "clsx";

const BOTTOM_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Txns" },
  { href: "/savings", icon: Target, label: "Savings" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/chat", icon: MessageCircle, label: "AI Chat" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--bg-secondary)] backdrop-blur-lg px-2 py-2 safe-area-bottom">
      <div className="flex justify-around">
        {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-card transition-all min-w-[56px]",
                active ? "text-mg-gold" : "text-[var(--text-muted)]"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
