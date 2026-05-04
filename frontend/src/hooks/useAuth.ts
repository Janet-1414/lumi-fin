"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { getMe } from "@/lib/auth";

export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, clearAuth } = useAuthStore();
  const { setTheme } = useThemeStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await getMe();
        setUser(me);
        setTheme(me.theme);
      } catch {
        clearAuth();
      }
    };
    fetchUser();
  }, []);

  return { user, isLoading, isAuthenticated, clearAuth };
}
