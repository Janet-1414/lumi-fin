"use client";
import { Camera, Lock } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";

export default function ReceiptScannerBanner() {
  const user = useUser();
  const isPro = user?.subscription_tier === "pro";

  return (
    <div className="flex items-center gap-3 p-4 rounded-card bg-[var(--bg-card)] border border-[var(--border)]">
      <div className="w-10 h-10 rounded-card bg-mg-gold/10 flex items-center justify-center flex-shrink-0">
        {isPro ? <Camera size={20} className="text-mg-gold" /> : <Lock size={20} className="text-[var(--text-muted)]" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {isPro ? "Scan Receipt or SMS" : "AI Receipt Scanner — Pro"}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {isPro
            ? "Upload a receipt or paste your Mobile Money SMS to auto-log transactions"
            : "Upgrade to automatically scan receipts and MTN/Airtel messages"}
        </p>
      </div>
      {!isPro && (
        <Link href="/subscription" className="text-xs font-semibold text-mg-gold border border-mg-gold/40 px-3 py-1.5 rounded-card hover:bg-mg-gold/20 transition-all flex-shrink-0">
          Unlock
        </Link>
      )}
    </div>
  );
}
