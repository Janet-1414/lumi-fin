"use client";
import { useUser } from "@/hooks/useUser";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function GreetingBanner() {
  const user = useUser();
  if (!user) return null;
  const today = new Date().toLocaleDateString("en-UG", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {getTimeGreeting()}, <span className="gradient-text">{user.first_name}</span> 👋
      </h1>
      <p className="text-sm text-[var(--text-muted)] mt-1">{today} · Here's your financial snapshot</p>
    </div>
  );
}
