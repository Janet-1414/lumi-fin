"use client";
import { useUser } from "@/hooks/useUser";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import MoneyPersonalityBadge from "@/components/profile/MoneyPersonalityBadge";
import BadgeGrid from "@/components/profile/BadgeGrid";
import NotificationPreferences from "@/components/profile/NotificationPreferences";
import CountryCurrencySettings from "@/components/profile/CountryCurrencySettings";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const user = useUser();
  const { setUser, clearAuth } = useAuthStore();
  const { badges } = useSavingsGoals();
  const router = useRouter();

  if (!user) return null;

  const isPro = user.subscription_tier === "pro";

  const handleUpdate = async (data: any) => {
    try {
      const updated = await api.patch<any>("/profile", data);
      setUser(updated);
      toast.success("Profile updated!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <ProfileHeader user={user} />

      <div className="space-y-4">
        <MoneyPersonalityBadge personality={user.money_personality} isPro={isPro} />

        <BadgeGrid badges={badges} />

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Appearance</h3>
          <ThemeToggle />
        </Card>

        <NotificationPreferences user={user} onUpdate={handleUpdate} />
        <CountryCurrencySettings user={user} onUpdate={handleUpdate} />

        {!isPro && (
          <Link
            href="/subscription"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-card bg-mg-gold/10 border border-mg-gold/30 text-mg-gold font-semibold text-sm hover:bg-mg-gold/20 transition-all"
          >
            ✦ Upgrade to Lumi Pro — $1/month
          </Link>
        )}

        <Button variant="danger" size="md" onClick={handleLogout} className="w-full">
          Sign out
        </Button>
      </div>
    </div>
  );
}
