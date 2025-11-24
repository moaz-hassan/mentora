import { useCallback } from "react";
import useAuthStoreZustand from "@/store/authStore";

/**
 * Custom hook for auth selectors
 * Memoizes selectors to prevent infinite loop warnings
 * Use this hook to get auth state instead of inline selectors
 */
export function useAuth() {
  const isAuthenticated = useAuthStoreZustand(
    useCallback((state) => state.isAuthenticated, [])
  );
  const user = useAuthStoreZustand(useCallback((state) => state.user, []));
  const isLoading = useAuthStoreZustand(
    useCallback((state) => state.isLoading, [])
  );
  const token = useAuthStoreZustand(useCallback((state) => state.token, []));

  return { isAuthenticated, user, isLoading, token };
}

/**
 * Get auth actions
 * Returns memoized action functions
 */
export function useAuthActions() {
  const setAuth = useAuthStoreZustand(
    useCallback((state) => state.setAuth, [])
  );
  const clearAuth = useAuthStoreZustand(
    useCallback((state) => state.clearAuth, [])
  );
  const updateUser = useAuthStoreZustand(
    useCallback((state) => state.updateUser, [])
  );
  const getToken = useAuthStoreZustand(
    useCallback((state) => state.getToken, [])
  );
  const initializeAuth = useAuthStoreZustand(
    useCallback((state) => state.initializeAuth, [])
  );

  return { setAuth, clearAuth, updateUser, getToken, initializeAuth };
}

/**
 * Combine state and actions
 * Use this for components that need both state and actions
 */
export function useAuthWithActions() {
  const state = useAuth();
  const actions = useAuthActions();
  return { ...state, ...actions };
}
