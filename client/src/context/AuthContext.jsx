import { createContext, useEffect, useMemo, useState, useCallback } from "react";
import authService from "../services/auth.service";
import toast from "react-hot-toast";
import { setupAuthInterceptors } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync tokens with global window object for axios interceptors
  const syncTokensWithWindow = useCallback((token, refresh) => {
    window.__AUTH_ACCESS_TOKEN__ = token || null;
    window.__AUTH_REFRESH_TOKEN__ = refresh || null;
  }, []);

  const saveSession = (tokens, userDetails) => {
    setToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUser(userDetails);
    syncTokensWithWindow(tokens.accessToken, tokens.refreshToken);
  };

  const clearSession = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    syncTokensWithWindow(null, null);
  };

  // Callbacks for axios interceptors
  const getToken = useCallback(() => accessToken, [accessToken]);
  const getRefreshToken = useCallback(() => refreshToken, [refreshToken]);

  const onTokenRefresh = useCallback((newAccessToken, newRefreshToken) => {
    if (newAccessToken && newRefreshToken) {
      setToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      syncTokensWithWindow(newAccessToken, newRefreshToken);
    } else {
      clearSession();
    }
  }, [syncTokensWithWindow]);

  // Setup axios interceptors with callbacks
  useEffect(() => {
    setupAuthInterceptors(getToken, getRefreshToken, onTokenRefresh);
  }, [getToken, getRefreshToken, onTokenRefresh]);

  const login = async ({ email, password }) => {
    const authResult = await authService.login({ email, password });
    saveSession(authResult, authResult.user);
    return authResult;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      toast.error(
        `Logout failed: ${error?.response?.data?.message || error?.message || "Unknown error"}`,
      );
    }

    clearSession();
  };

  const initializeSession = async () => {
    setLoading(true);

    try {
      const refreshed = await authService.refresh();
      if (!refreshed?.accessToken) {
        clearSession();
        return;
      }
      if (refreshed?.accessToken) {
        setToken(refreshed.accessToken);
        setRefreshToken(refreshed.refreshToken);
        syncTokensWithWindow(refreshed.accessToken, refreshed.refreshToken);
      }

      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: !!accessToken,
      loading,
      login,
      logout,
    }),
    [user, accessToken, refreshToken, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
