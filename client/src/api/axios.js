import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshTokenCallback ? getRefreshTokenCallback() : null;

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          // The refresh token is normally in an HttpOnly cookie. Sending the
          // in-memory token as a fallback preserves compatibility with older
          // sessions without exposing the cookie to JavaScript.
          refreshToken ? { refreshToken } : {},
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Update tokens via callback
        if (onTokenRefreshCallback) {
          onTokenRefreshCallback(accessToken, newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens via callback
        if (onTokenRefreshCallback) {
          onTokenRefreshCallback(null, null);
        }
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
