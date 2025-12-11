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

      
      fetchUser: async () => {
        set({ isLoading: true }); 

        try {
          
          const response = await getUserDataOnClient();

          if (response && response.success) {
            
            set({
              isAuthenticated: true,
              user: response.data,
              isLoading: false,
            });
          } else {
            
            get().clearAuth();
          }
        } catch (error) {
          console.log(error);
          get().clearAuth(); 
        }
      },

      clearAuth: () => {
        set(() => ({
          isAuthenticated: false,
          user: null,
          isLoading: false, 
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
