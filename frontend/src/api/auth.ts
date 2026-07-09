// File responsibility: Wraps authentication API calls for login, registration, session lookup, and logout.
import { apiClient, unwrapResponse } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "../types";

/**
 * Sends login credentials and returns tokens plus the authenticated user profile.
 * payload stores the email and password submitted by the login form.
 */
export function login(payload: LoginRequest) {
  return unwrapResponse<AuthResponse>(apiClient.post("/auth/login", payload));
}

/**
 * Creates a user account and returns an authenticated session.
 * payload stores registration form fields such as username, name, email, and password.
 */
export function register(payload: RegisterRequest) {
  return unwrapResponse<AuthResponse>(apiClient.post("/auth/register", payload));
}

/**
 * Loads the current user profile for the active access token.
 */
export function getMe() {
  return unwrapResponse<User>(apiClient.get("/auth/me"));
}

/**
 * Requests backend logout for the active session.
 */
export function logout() {
  return unwrapResponse<void>(apiClient.post("/auth/logout"));
}
