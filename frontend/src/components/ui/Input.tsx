import { forwardRef, InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full rounded-card border bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
            "px-3 py-2.5 text-sm transition-all duration-200",
            "border-[var(--border)] focus:outline-none focus:border-mg-gold focus:ring-1 focus:ring-mg-gold/30",
            icon && "pl-10",
            error && "border-mg-alert focus:border-mg-alert focus:ring-mg-alert/30",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-mg-alert">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
export default Input;
