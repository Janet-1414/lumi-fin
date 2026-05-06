import Link from "next/link";
import { Zap, ArrowRight, Shield, Brain, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAC775] flex items-center justify-center">
            <Zap size={18} className="text-[#0A0F1E]" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-[#FAC775]">Lumi</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-[#FAC775] text-[#0A0F1E] text-sm font-semibold rounded-xl hover:bg-yellow-400 transition-all">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#FAC775]/30 bg-[#FAC775]/10 text-[#FAC775] text-xs font-medium mb-6">
          <Zap size={12} fill="currentColor" />
          Built for East African youth
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
          Your Financial Future,{" "}
          <span className="text-[#FAC775]">Illuminated.</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Lumi is the AI-powered financial companion built for Uganda, Kenya,
          Tanzania, Rwanda, and beyond. Track spending, crush savings goals, and
          get personalised advice — all in your local currency.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FAC775] text-[#0A0F1E] font-bold rounded-xl hover:bg-yellow-400 transition-all text-base">
            Start for free
            <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-xl hover:border-[#FAC775]/50 transition-all text-base">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl font-bold mb-12">
          Everything you need to win financially
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Brain,
              title: "AI-Powered Insights",
              desc: "11 AI features including receipt scanning, savings coaching, and natural language chat — all understanding your East African context.",
              color: "text-[#FAC775]",
              bg: "bg-[#FAC775]/10",
            },
            {
              icon: Target,
              title: "Savings Goals",
              desc: "Set goals, track progress with streaks and badges, and get AI coaching to stay on track. Earn investment hints when you're consistent.",
              color: "text-[#1D9E75]",
              bg: "bg-[#1D9E75]/10",
            },
            {
              icon: Shield,
              title: "Community Privacy",
              desc: "Share wins and compete on the leaderboard — 100% anonymously. No real names, no actual amounts. Only percentages.",
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="p-6 rounded-xl border border-white/10 bg-white/3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Countries */}
      <section className="px-6 py-12 text-center border-y border-white/5">
        <p className="text-sm text-gray-400 mb-4">Supporting East African currencies</p>
        <div className="flex justify-center flex-wrap gap-3">
          {[
            ["🇺🇬", "Uganda", "UGX"],
            ["🇰🇪", "Kenya", "KES"],
            ["🇹🇿", "Tanzania", "TZS"],
            ["🇷🇼", "Rwanda", "RWF"],
            ["🇪🇹", "Ethiopia", "ETB"],
            ["🇧🇮", "Burundi", "BIF"],
            ["🇸🇸", "S. Sudan", "SSP"],
          ].map(([flag, name, code]) => (
            <div key={code} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-sm">
              <span>{flag}</span>
              <span className="text-gray-300">{name}</span>
              <span className="text-[#FAC775] text-xs font-medium">{code}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 py-20">
        <h2 className="text-3xl font-black mb-4">Ready to illuminate your finances?</h2>
        <p className="text-gray-400 mb-8">Free forever · Pro for just $1/month when ready.</p>
        <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-[#FAC775] text-[#0A0F1E] font-bold rounded-xl hover:bg-yellow-400 transition-all">
          <Zap size={18} fill="currentColor" />
          Get started — it&apos;s free
        </Link>
      </section>

      <footer className="text-center py-8 border-t border-white/5 text-xs text-gray-600">
        © {new Date().getFullYear()} Lumi · Built for East African youth
      </footer>
    </div>
  );
}