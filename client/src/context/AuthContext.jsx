import { createContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import authService from "../services/auth.service";
import toast from "react-hot-toast";
import { setupAuthInterceptors } from "../api/axios";

const AuthContext = createContext(null);
const SESSION_MARKER = "pnrg.auth.session";

const REFRESH_TOKEN_KEY = "pnrg.refresh_token";

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
      const newRefresh = tokens.refreshToken || null;
      setRefreshToken(newRefresh);
      setUser(userDetails);
      syncTokensWithWindow(tokens.accessToken, newRefresh);
      window.sessionStorage.setItem(SESSION_MARKER, "1");
      if (newRefresh) {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
      }
    },
    [syncTokensWithWindow],
  );

  const clearSession = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    syncTokensWithWindow(null, null);
    window.sessionStorage.removeItem(SESSION_MARKER);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, [syncTokensWithWindow]);

  // Callbacks for axios interceptors
  const getToken = useCallback(
    () => accessToken || window.__AUTH_ACCESS_TOKEN__ || null,
    [accessToken],
  );
  const getRefreshToken = useCallback(
    () =>
      refreshToken ||
      window.__AUTH_REFRESH_TOKEN__ ||
      window.localStorage.getItem(REFRESH_TOKEN_KEY) ||
      null,
    [refreshToken],
  );

  const onTokenRefresh = useCallback(
    (newAccessToken, newRefreshToken) => {
      if (newAccessToken) {
        setToken(newAccessToken);
        const activeRefresh =
          newRefreshToken ||
          refreshToken ||
          window.localStorage.getItem(REFRESH_TOKEN_KEY);
        if (activeRefresh) {
          setRefreshToken(activeRefresh);
          window.localStorage.setItem(REFRESH_TOKEN_KEY, activeRefresh);
        }
        syncTokensWithWindow(newAccessToken, activeRefresh);
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
    async (credentials) => {
      const authResult = await authService.login(credentials);
      saveSession(authResult, authResult.user);
      return authResult;
    },
    [saveSession],
  );

  const logout = useCallback(async () => {
    try {
      const activeRefresh =
        refreshToken ||
        window.__AUTH_REFRESH_TOKEN__ ||
        window.localStorage.getItem(REFRESH_TOKEN_KEY);
      await authService.logout(activeRefresh);
    } catch (error) {
      toast.error(
        `Logout failed: ${error?.response?.data?.message || error?.message || "Unknown error"}`,
      );
    }

    clearSession();
  }, [refreshToken, clearSession]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const activeRefresh =
      window.__AUTH_REFRESH_TOKEN__ ||
      window.localStorage.getItem(REFRESH_TOKEN_KEY);

    const hasSessionMarker = window.sessionStorage.getItem(SESSION_MARKER) === "1";

    if (!hasSessionMarker && !activeRefresh) {
      setLoading(false);
      return;
    }

    async function initSession() {
      try {
        const refreshed = await authService.refresh(activeRefresh);
        if (!refreshed?.accessToken) {
          clearSession();
          return;
        }
        setToken(refreshed.accessToken);
        const newRefresh = refreshed.refreshToken || activeRefresh;
        setRefreshToken(newRefresh || null);
        if (newRefresh) {
          window.localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
        }
        syncTokensWithWindow(refreshed.accessToken, newRefresh || null);

        const profile = await authService.getProfile();
        setUser(profile);
      } catch (err) {
        console.error("Auth init session failed:", err);
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    void initSession();
  }, [clearSession, syncTokensWithWindow]);

  const hasPermission = useCallback(
    (perm) => {
      if (!user || !user.permissions) return false;
      const userPerms = (user.permissions || []).map((p) =>
        String(p).toUpperCase().replace(/\./g, "_")
      );
      const permList = Array.isArray(perm) ? perm : [perm];
      const normCheck = permList.map((p) =>
        String(p).toUpperCase().replace(/\./g, "_")
      );
      return normCheck.some((p) => userPerms.includes(p));
    },
    [user]
  );

  const hasRole = useCallback(
    (...roles) => {
      if (!user || !user.role_name) return false;
      const currentRole = String(user.role_name)
        .toUpperCase()
        .replace(/\s+/g, "_");
      return roles
        .map((r) => String(r).toUpperCase().replace(/\s+/g, "_"))
        .includes(currentRole);
    },
    [user]
  );

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
      hasPermission,
      hasRole,
    }),
    [user, accessToken, refreshToken, loading, login, logout, hasPermission, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
