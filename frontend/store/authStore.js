import getUserDataOnClient from "@/lib/apiCalls/auth/getUserDataOnClient.apiCall";
import Cookies from "js-cookie";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,

      setAuth: (userData) => {
        set(() => ({
          isAuthenticated: true,
          user: userData,
          isLoading: false,
        }));
      },

      // FIX 1: Make this async
      fetchUser: async () => {
        set({ isLoading: true }); // Start loading

        try {
          // FIX 2: Await the API call
          const response = await getUserDataOnClient();

          if (response && response.success) {
            // FIX 3: Correct way to update state
            set({
              isAuthenticated: true,
              user: response.data,
              isLoading: false,
            });
          } else {
            // If API returns false (token expired), clear auth to stop loop
            get().clearAuth();
          }
        } catch (error) {
          console.log(error);
          get().clearAuth(); // Safety net: Logout on error
        }
      },

      clearAuth: () => {
        set(() => ({
          isAuthenticated: false,
          user: null,
          isLoading: false, // Stop loading so we can redirect
        }));
        localStorage.removeItem("auth-store");
        Cookies.remove("authToken");
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;
