import { api } from "./api";
import type { User } from "@/types/user";
import type { TokenResponse } from "@/types/api";

export async function signUp(payload: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  country: string;
}): Promise<TokenResponse> {
  return api.post<TokenResponse>("/auth/signup", payload);
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  return api.post<TokenResponse>("/auth/login", { email, password });
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMe(): Promise<User> {
  return api.get<User>("/auth/me");
}
