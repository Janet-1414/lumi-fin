"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, User, Mail, Lock } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CountrySelect from "@/components/ui/CountrySelect";
import { signUp } from "@/lib/auth";
import { validatePassword } from "@/lib/validators";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", country: "" });
  const [currency, setCurrency] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.first_name.trim()) newErrors.first_name = "First name is required";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!form.email.includes("@")) newErrors.email = "Enter a valid email";
    if (!form.country) newErrors.country = "Please select your country";
    const pwd = validatePassword(form.password);
    if (!pwd.isValid) newErrors.password = pwd.errors[0];
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const data = await signUp(form);
      setUser(data.user);
      toast.success(`Welcome to Lumi, ${data.user.first_name}! 🌟`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="min-h-screen bg-mg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-mg-gold flex items-center justify-center shadow-gold-glow mx-auto mb-4">
            <Zap size={24} className="text-mg-bg" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-gray-400 mt-1">Free forever · Pro for $1/month</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="Nakato" error={errors.first_name} icon={<User size={14} />} required />
            <Input label="Last name" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Namukasa" error={errors.last_name} required />
          </div>
          <Input label="Email address" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nakato@example.com" error={errors.email} icon={<Mail size={16} />} required />
          <CountrySelect
            value={form.country}
            onChange={(country, curr) => { set("country", country); setCurrency(curr); }}
            error={errors.country}
          />
          {currency && (
            <p className="text-xs text-mg-gold bg-mg-gold/10 px-3 py-2 rounded-card border border-mg-gold/20">
              ✓ Your currency is set to <strong>{currency}</strong>
            </p>
          )}
          <Input label="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 8 chars with symbols" error={errors.password} icon={<Lock size={16} />} required />
          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-mg-gold hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
