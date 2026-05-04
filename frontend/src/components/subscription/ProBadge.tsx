"use client";
import { Zap } from "lucide-react";

export default function ProBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-mg-gold text-mg-bg font-bold text-sm shadow-gold-glow animate-pulse-gold">
      <Zap size={16} fill="currentColor" />
      Lumi Pro
    </div>
  );
}
