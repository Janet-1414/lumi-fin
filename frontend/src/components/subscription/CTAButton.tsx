"use client";
import { useState } from "react";
import { Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function CTAButton() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    toast("Lumi Pro payments are coming soon! 🚀 We'll notify you when it goes live.", { icon: "💛", duration: 5000 });
    setTimeout(() => setClicked(false), 3000);
  };

  return (
    <div className="text-center space-y-3">
      <Button
        variant="primary"
        size="lg"
        onClick={handleClick}
        className="w-full max-w-xs shadow-gold-glow text-base font-bold"
      >
        <Zap size={18} fill="currentColor" />
        {clicked ? "Coming Soon! 🚀" : "Get Lumi Pro — $1/month"}
      </Button>
      <p className="text-xs text-[var(--text-muted)]">No credit card required now · Cancel anytime when live</p>
    </div>
  );
}
