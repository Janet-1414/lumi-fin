"use client";
import Card from "@/components/ui/Card";
import type { User } from "@/types/user";

interface NotificationPreferencesProps {
  user: User;
  onUpdate: (data: { email_notifications?: boolean; push_notifications?: boolean }) => void;
}

export default function NotificationPreferences({ user, onUpdate }: NotificationPreferencesProps) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Notifications</h3>
      <div className="space-y-4">
        {[
          { key: "email_notifications", label: "Email notifications", desc: "Spending alerts, goal updates, weekly reports", value: user.email_notifications },
          { key: "push_notifications", label: "In-app notifications", desc: "Real-time alerts and AI insights", value: user.push_notifications },
        ].map(({ key, label, desc, value }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
              <p className="text-xs text-[var(--text-muted)]">{desc}</p>
            </div>
            <button
              onClick={() => onUpdate({ [key]: !value })}
              className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-mg-success" : "bg-[var(--border)]"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
