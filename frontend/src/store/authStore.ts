// File responsibility: Stores authenticated user identity, JWT tokens, and session mutation helpers.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, User } from "../types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setSession: (auth: AuthResponse) => void;
  setUser: (user: User | null) => void;
  clearSession: () => void;
}

/**
 * Persists authenticated session data.
 * accessToken/refreshToken store backend JWTs; user stores the current profile used by permissions and display labels.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          user: auth.user
        }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null })
    }),
    {
      name: "taskmanager-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user
      })
    }
  )
);
