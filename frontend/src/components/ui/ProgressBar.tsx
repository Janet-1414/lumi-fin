import { clsx } from "clsx";

interface ProgressBarProps {
  value: number; // 0-100
  color?: "gold" | "success" | "alert";
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ value, color = "gold", size = "sm", showLabel, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const colors = {
    gold: "bg-mg-gold",
    success: "bg-mg-success",
    alert: "bg-mg-alert",
  };
  const heights = { sm: "h-1.5", md: "h-2.5" };

  return (
    <div className={clsx("w-full", className)}>
      <div className={clsx("w-full rounded-full bg-[var(--border)]", heights[size])}>
        <div
          className={clsx("rounded-full transition-all duration-500", heights[size], colors[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[var(--text-muted)]">{clamped.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
