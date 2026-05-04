import { clsx } from "clsx";

interface BadgeProps {
  label: string;
  variant?: "gold" | "success" | "alert" | "default" | "pro";
  size?: "sm" | "md";
}

export default function Badge({ label, variant = "default", size = "sm" }: BadgeProps) {
  const variants = {
    gold: "bg-mg-gold/20 text-mg-gold border border-mg-gold/30",
    success: "bg-mg-success/20 text-mg-success border border-mg-success/30",
    alert: "bg-mg-alert/20 text-mg-alert border border-mg-alert/30",
    default: "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]",
    pro: "bg-gradient-to-r from-mg-gold to-yellow-500 text-mg-bg font-semibold",
  };
  const sizes = { sm: "px-2 py-0.5 text-xs", md: "px-3 py-1 text-sm" };

  return (
    <span className={clsx("inline-flex items-center rounded-full font-medium", variants[variant], sizes[size])}>
      {label}
    </span>
  );
}
