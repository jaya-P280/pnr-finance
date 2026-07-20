import { createContext, useEffect, useMemo, useState } from "react";
import authService from "../services/auth.service";
import {
  setAccessToken,
  clearAccessToken,
  getAccessToken,
} from "../utils/token.utils";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setToken] = useState(() => getAccessToken());
  const [loading, setLoading] = useState(true);

  const saveSession = (token, userDetails) => {
    setToken(token);
    setUser(userDetails);
    setAccessToken(token);
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    clearAccessToken();
  };

  const login = async ({ email, password }) => {
    const authResult = await authService.login({ email, password });
    saveSession(authResult.accessToken, authResult.user);
    console.log(authResult)
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
        setAccessToken(refreshed.accessToken);
      }

      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.log(error);
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
      isAuthenticated: !!accessToken,
      loading,
      login,
      logout,
    }),
    [user, accessToken, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
