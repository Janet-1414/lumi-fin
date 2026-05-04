"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { login } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const { setTheme } = useThemeStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login(email, password);
      setUser(data.user);
      setTheme(data.user.theme);
      toast.success(`Welcome back, ${data.user.first_name}! 👋`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-mg-gold flex items-center justify-center shadow-gold-glow mx-auto mb-4">
            <Zap size={24} className="text-mg-bg" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your Lumi account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nakato@example.com"
            icon={<Mail size={16} />}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            icon={<Lock size={16} />}
            required
            autoComplete="current-password"
          />
          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{" "}
          <Link href="/signup" className="text-mg-gold hover:underline font-medium">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
