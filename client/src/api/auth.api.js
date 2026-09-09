import api from "./axios";
import ENDPOINTS from "./endpoint";

export const login = (data) => api.post(ENDPOINTS.AUTH.LOGIN, data);
export const sendOtp = (data) => api.post(`${ENDPOINTS.AUTH.LOGIN.replace('/login', '/send-otp')}`, data);
export const register = (data) => api.post(ENDPOINTS.AUTH.REGISTER, data);
export const refresh = (refreshToken) => api.post(ENDPOINTS.AUTH.REFRESH, refreshToken ? { refreshToken } : {});
export const logout = (refreshToken) => api.post(ENDPOINTS.AUTH.LOGOUT, refreshToken ? { refreshToken } : {});
export const getProfile = () => api.get(ENDPOINTS.AUTH.PROFILE);
export const updateProfile = (data) => api.put(ENDPOINTS.AUTH.PROFILE, data);
