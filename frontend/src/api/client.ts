// File responsibility: Configures the shared Axios client, auth interceptors, response unwrapping, and API error formatting.
import axios, { AxiosError, type AxiosResponse } from "axios";
import { useAuthStore } from "../store/authStore";
import type { ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Shared HTTP client; API_BASE_URL stores the backend root used by every request wrapper.
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  const requestUrl = config.url ?? "";
  const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const requestUrl = error.config?.url ?? "";
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (error.response?.status === 401 && !isAuthRequest) {
      useAuthStore.getState().clearSession();
    }

    return Promise.reject(error);
  }
);

/**
 * Extracts the typed data payload from the standard backend envelope.
 * request stores the pending Axios request whose response body follows ApiResponse<T>.
 */
export async function unwrapResponse<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const response = await request;
  const body = response.data;

  if (!body.success) {
    throw new Error(body.message || body.error || "Request failed");
  }

  return body.data;
}

/**
 * Converts Axios, Error, or unknown thrown values into text that forms can display.
 * error stores the rejected value from React Query or an async API call.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
