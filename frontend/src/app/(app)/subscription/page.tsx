"use client";
import { Zap, Star } from "lucide-react";
import ProBadge from "@/components/subscription/ProBadge";
import FeatureList from "@/components/subscription/FeatureList";
import PlanComparisonTable from "@/components/subscription/PlanComparisonTable";
import CTAButton from "@/components/subscription/CTAButton";
import { useUser } from "@/hooks/useUser";

export default function SubscriptionPage() {
  const user = useUser();

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center py-10">
        <ProBadge />
        <h1 className="text-3xl font-black mt-5 mb-3 text-[var(--text-primary)]">
          Unlock your full{" "}
          <span className="gradient-text">financial potential</span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto leading-relaxed">
          {user?.first_name}, Lumi Pro gives you every AI-powered tool you need to master your money
          — all designed specifically for East African youth.
        </p>
      </div>

      {/* Price card */}
      <div className="glass-card gold-glow p-8 text-center mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-mg-gold to-transparent" />
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-5xl font-black text-mg-gold">$1</span>
          <span className="text-[var(--text-muted)] text-sm">/month</span>
        </div>
        <p className="text-[var(--text-muted)] text-sm mb-6">Less than a boda ride. More than you'd expect.</p>
        <CTAButton />

        {/* Social proof */}
        <div className="flex items-center justify-center gap-1 mt-5">
          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#FAC775" className="text-mg-gold" />)}
          <span className="text-xs text-[var(--text-muted)] ml-2">Loved by East African youth</span>
        </div>
      </div>

      {/* What's included */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-mg-gold" fill="currentColor" />
          <h2 className="text-base font-bold text-[var(--text-primary)]">Everything in Lumi Pro</h2>
        </div>
        <FeatureList />
      </div>

      {/* Comparison table */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Free vs Pro</h2>
        <PlanComparisonTable />
      </div>

      {/* Final CTA */}
      <div className="text-center pb-10">
        <CTAButton />
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Payments powered by Stripe · Secure & encrypted · Cancel anytime
        </p>
      </div>
    </div>
  );
}
