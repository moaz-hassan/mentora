import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        user: null,
        isLoading: true,
        token: null,

        initializeAuth: () => {
          const token = getCookie("authToken");
          if (token) {
            const userData = localStorage.getItem("user_data");
            set({
              isAuthenticated: true,
              user: userData ? JSON.parse(userData) : null,
              token,
              isLoading: false,
            });
          } else {
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
            });
          }
        },

        setAuth: (userData, token = null) => {
          set({
            isAuthenticated: true,
            user: userData,
            token: token || getCookie("authToken"),
            isLoading: false,
          });
          localStorage.setItem("user_data", JSON.stringify(userData));
        },

        updateUser: (userData) => {
          set({ user: userData });
          localStorage.setItem("user_data", JSON.stringify(userData));
        },

        clearAuth: () => {
          localStorage.removeItem("user_data");
          localStorage.removeItem("course_creation_draft");

          if (typeof document !== "undefined") {
            document.cookie =
              "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }

          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
        },

        getToken: () => {
          const state = get();
          return state.token || getCookie("authToken");
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        getAuthState: () => {
          return {
            isAuthenticated: get().isAuthenticated,
            user: get().user,
            isLoading: get().isLoading,
            token: get().token,
          };
        },
      }),
      {
        name: "auth-store", 
        partialize: (state) => ({
          user: state.user, 
        }),
      }
    ),
    { name: "AuthStore" }
  )
);

  function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export default useAuthStore;
