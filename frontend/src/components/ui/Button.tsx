import { forwardRef, ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, children, className, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-card transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mg-gold";
    const variants = {
      primary: "bg-mg-gold text-mg-bg hover:bg-yellow-400 shadow-gold-glow-sm active:scale-95",
      secondary: "bg-mg-card border border-mg-border text-[var(--text-primary)] hover:border-mg-gold/50",
      ghost: "text-[var(--text-secondary)] hover:text-mg-gold hover:bg-mg-gold/10",
      danger: "bg-mg-alert text-white hover:bg-red-600 active:scale-95",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </span>
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
