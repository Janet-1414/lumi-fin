import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ glow, hoverable, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "glass-card p-5 transition-all duration-200",
        glow && "gold-glow",
        hoverable && "hover:border-mg-gold/40 hover:shadow-gold-glow-sm cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";
export default Card;
