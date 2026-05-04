"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-card border border-[var(--border)] text-[var(--text-secondary)] hover:text-mg-gold hover:border-mg-gold/50 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      <span className="text-sm">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
