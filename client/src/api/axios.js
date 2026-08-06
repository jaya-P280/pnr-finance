import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get token from context via a callback that will be set by the auth interceptor setup
let getTokenCallback = null;
let getRefreshTokenCallback = null;
let onTokenRefreshCallback = null;

export function setupAuthInterceptors(getToken, getRefreshToken, onTokenRefresh) {
  getTokenCallback = getToken;
  getRefreshTokenCallback = getRefreshToken;
  onTokenRefreshCallback = onTokenRefresh;
}

api.interceptors.request.use(
  (config) => {
    const token = getTokenCallback ? getTokenCallback() : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    const hasRefreshSession =
      Boolean(getRefreshTokenCallback?.()) ||
      Boolean(window.localStorage.getItem("pnrg.refresh_token")) ||
      window.sessionStorage.getItem("pnrg.auth.session") === "1";

    if (
      error.response?.status === 401 &&
      hasRefreshSession &&
      !isRefreshRequest &&
      !isLoginRequest
    ) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken =
          (getRefreshTokenCallback ? getRefreshTokenCallback() : null) ||
          window.localStorage.getItem("pnrg.refresh_token");

        const apiBase = import.meta.env.VITE_API_BASE_URL || "/api/v1";
        const response = await axios.post(
          `${apiBase}/auth/refresh`,
          refreshToken ? { refreshToken } : {},
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Update tokens via callback
        if (onTokenRefreshCallback) {
          onTokenRefreshCallback(accessToken, newRefreshToken);
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        window.sessionStorage.removeItem("pnrg.auth.session");
        window.localStorage.removeItem("pnrg.refresh_token");

        // Clear tokens via callback
        if (onTokenRefreshCallback) {
          onTokenRefreshCallback(null, null);
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
