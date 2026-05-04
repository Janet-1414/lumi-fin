import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mg-bg flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-xl bg-mg-gold/20 flex items-center justify-center mb-6">
        <Zap size={32} className="text-mg-gold" />
      </div>
      <h1 className="text-4xl font-black text-white mb-3">404</h1>
      <p className="text-gray-400 mb-6">This page doesn't exist. Let's get you back on track.</p>
      <Link href="/dashboard" className="px-6 py-3 bg-mg-gold text-mg-bg font-bold rounded-card hover:bg-yellow-400 transition-all">
        Back to Dashboard
      </Link>
    </div>
  );
}
