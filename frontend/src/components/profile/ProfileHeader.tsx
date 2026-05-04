"use client";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import type { User } from "@/types/user";

export default function ProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Avatar name={`${user.first_name} ${user.last_name}`} size="lg" />
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{user.first_name} {user.last_name}</h1>
        <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge label={user.subscription_tier === "pro" ? "✦ Lumi Pro" : "Free"} variant={user.subscription_tier === "pro" ? "pro" : "default"} />
          <Badge label={`${user.country} · ${user.currency_code}`} variant="default" />
        </div>
      </div>
    </div>
  );
}
