"use client";
import { useAuthStore } from "@/store/authStore";
export function useUser() {
  return useAuthStore((s) => s.user);
}
