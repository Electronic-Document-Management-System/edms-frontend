import { create } from "zustand";
import { loginApi, logoutApi } from "@/features/auth/auth.api";
import { AuthUser, LoginInput } from "@/features/auth/auth.types";
import { persist } from "zustand/middleware";

type LoginResult = {
  success: boolean;
};

type LogoutResult = {
  success: boolean;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (input: LoginInput) => Promise<LoginResult>;
  logout: () => Promise<LogoutResult>;
  clearError: () => void;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isLoggingOut: false,
      error: null,
      isAuthenticated: false,

      login: async (input) => {
        try {
          set({ isLoading: true, error: null });

          const user = await loginApi(input);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Login failed";

          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
          });

          return { success: false };
        }
      },

      logout: async () => {
        try {
          set({ isLoggingOut: true, error: null });

          await logoutApi();
          useAuthStore.persist.clearStorage();

          set({
            user: null,
            isAuthenticated: false,
            isLoggingOut: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Logout failed";

          set({
            isLoggingOut: false,
            error: message,
          });

          return { success: false };
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "edms-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;