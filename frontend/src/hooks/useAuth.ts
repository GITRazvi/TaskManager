// File responsibility: Provides React Query hooks that synchronize authentication API calls with the auth store.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../api/auth";
import { useAuthStore } from "../store/authStore";

/**
 * Loads and stores the current user when an access token exists.
 */
export function useCurrentUser() {
  const token = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    onSuccess: setUser
  });
}

/**
 * Logs in and stores the returned user and token session.
 */
export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: setSession
  });
}

/**
 * Registers a new account and stores the returned user and token session.
 */
export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: setSession
  });
}

/**
 * Logs out, clears auth state, and removes cached query data.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
    }
  });
}
