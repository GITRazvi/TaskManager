import { apiClient, unwrapResponse } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "../types";

export function login(payload: LoginRequest) {
  return unwrapResponse<AuthResponse>(apiClient.post("/auth/login", payload));
}

export function register(payload: RegisterRequest) {
  return unwrapResponse<AuthResponse>(apiClient.post("/auth/register", payload));
}

export function getMe() {
  return unwrapResponse<User>(apiClient.get("/auth/me"));
}

export function logout() {
  return unwrapResponse<void>(apiClient.post("/auth/logout"));
}
