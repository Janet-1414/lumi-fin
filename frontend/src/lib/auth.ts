import { api } from "./api";
import type { User } from "@/types/user";
import type { TokenResponse } from "@/types/api";

const TOKEN_KEY = "lumi_access_token";

export function saveToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}

export async function signUp(payload: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  country: string;
}): Promise<TokenResponse> {
  const res = await api.post<TokenResponse>("/auth/signup", payload);
  if (res.access_token) saveToken(res.access_token);
  return res;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const res = await api.post<TokenResponse>("/auth/login", { email, password });
  if (res.access_token) saveToken(res.access_token);
  return res;
}

export async function logout(): Promise<void> {
  clearToken();
  await api.post("/auth/logout");
}

export async function getMe(): Promise<User> {
  return api.get<User>("/auth/me");
}