import { ShoppingBag, Car, Utensils, Zap, Heart, BookOpen, Music, PiggyBank, Briefcase, Smartphone, Home, MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";
import type { TransactionCategory } from "@/types/transaction";

const ICONS: Record<TransactionCategory, { icon: React.ElementType; color: string; bg: string }> = {
  food: { icon: Utensils, color: "text-orange-400", bg: "bg-orange-400/10" },
  transport: { icon: Car, color: "text-blue-400", bg: "bg-blue-400/10" },
  entertainment: { icon: Music, color: "text-purple-400", bg: "bg-purple-400/10" },
  utilities: { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  health: { icon: Heart, color: "text-red-400", bg: "bg-red-400/10" },
  education: { icon: BookOpen, color: "text-green-400", bg: "bg-green-400/10" },
  shopping: { icon: ShoppingBag, color: "text-pink-400", bg: "bg-pink-400/10" },
  savings: { icon: PiggyBank, color: "text-mg-success", bg: "bg-mg-success/10" },
  salary: { icon: Briefcase, color: "text-mg-gold", bg: "bg-mg-gold/10" },
  freelance: { icon: Briefcase, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  mobile_money: { icon: Smartphone, color: "text-mg-gold", bg: "bg-mg-gold/10" },
  rent: { icon: Home, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  other: { icon: MoreHorizontal, color: "text-[var(--text-muted)]", bg: "bg-[var(--border)]" },
};

interface CategoryIconProps {
  category: TransactionCategory;
  size?: "sm" | "md";
}

export default function CategoryIcon({ category, size = "md" }: CategoryIconProps) {
  const { icon: Icon, color, bg } = ICONS[category] || ICONS.other;
  const sizes = { sm: "w-8 h-8", md: "w-10 h-10" };
  const iconSizes = { sm: 14, md: 18 };

  return (
    <div className={clsx("rounded-card flex items-center justify-center flex-shrink-0", sizes[size], bg)}>
      <Icon size={iconSizes[size]} className={color} />
    </div>
  );
}
