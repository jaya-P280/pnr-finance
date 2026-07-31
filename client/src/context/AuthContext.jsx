import { createContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import authService from "../services/auth.service";
import toast from "react-hot-toast";
import { setupAuthInterceptors } from "../api/axios";

const AuthContext = createContext(null);
const SESSION_MARKER = "pnrg.auth.session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  // Sync tokens with global window object for axios interceptors
  const syncTokensWithWindow = useCallback((token, refresh) => {
    window.__AUTH_ACCESS_TOKEN__ = token || null;
    window.__AUTH_REFRESH_TOKEN__ = refresh || null;
  }, []);

  const saveSession = useCallback(
    (tokens, userDetails) => {
      setToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken || null);
      setUser(userDetails);
      syncTokensWithWindow(tokens.accessToken, tokens.refreshToken);
      window.sessionStorage.setItem(SESSION_MARKER, "1");
    },
    [syncTokensWithWindow],
  );

  const clearSession = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
      syncTokensWithWindow(null, null);
      window.sessionStorage.removeItem(SESSION_MARKER);
  }, [syncTokensWithWindow]);

  // Callbacks for axios interceptors
  const getToken = useCallback(
    () => accessToken || window.__AUTH_ACCESS_TOKEN__ || null,
    [accessToken],
  );
  const getRefreshToken = useCallback(
    () => refreshToken || window.__AUTH_REFRESH_TOKEN__ || null,
    [refreshToken],
  );

  const onTokenRefresh = useCallback(
    (newAccessToken, newRefreshToken) => {
      if (newAccessToken) {
        setToken(newAccessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }
        syncTokensWithWindow(newAccessToken, newRefreshToken || refreshToken);
      } else {
        clearSession();
      }
    },
    [clearSession, refreshToken, syncTokensWithWindow],
  );

  // Setup axios interceptors with callbacks
  useEffect(() => {
    setupAuthInterceptors(getToken, getRefreshToken, onTokenRefresh);
  }, [getToken, getRefreshToken, onTokenRefresh]);

  const login = useCallback(
    async ({ email, password }) => {
      const authResult = await authService.login({ email, password });
      saveSession(authResult, authResult.user);
      return authResult;
    },
    [saveSession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      toast.error(
        `Logout failed: ${error?.response?.data?.message || error?.message || "Unknown error"}`,
      );
    }

    clearSession();
  }, [clearSession]);

  const initializeSession = useCallback(
    async () => {
      // Do not call the refresh endpoint for a fresh, anonymous browser tab.
      // This avoids a 401 retry/noise loop when no refresh cookie exists.
      if (window.sessionStorage.getItem(SESSION_MARKER) !== "1") {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const refreshed = await authService.refresh();
        if (!refreshed?.accessToken) {
          clearSession();
          return;
        }
        setToken(refreshed.accessToken);
        setRefreshToken(refreshed.refreshToken || null);
        syncTokensWithWindow(
          refreshed.accessToken,
          refreshed.refreshToken || null,
        );

        const profile = await authService.getProfile();
        setUser(profile);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    },
    [clearSession, syncTokensWithWindow],
  );

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const timer = window.setTimeout(() => {
      void initializeSession();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initializeSession]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      accessToken,
      refreshToken,
      isAuthenticated: !!accessToken,
      loading,
      login,
      logout,
    }),
    [user, accessToken, refreshToken, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
