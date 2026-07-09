// File responsibility: Stores the selected UI theme and persists it across sessions.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Resolves the initial theme from the browser color-scheme preference.
 */
const getPreferredTheme = (): Theme => {
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
};

/**
 * Persists theme selection and exposes helpers for direct selection or toggling.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getPreferredTheme(),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" }))
    }),
    {
      name: "taskmanager-theme"
    }
  )
);
