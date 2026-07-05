import axios, { AxiosError, type AxiosResponse } from "axios";
import { useAuthStore } from "../store/authStore";
import type { ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

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

export async function unwrapResponse<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const response = await request;
  const body = response.data;

  if (!body.success) {
    throw new Error(body.message || body.error || "Request failed");
  }

  return body.data;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
