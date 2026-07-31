import api from "./axios";
import ENDPOINTS from "./endpoint";

export const login = (data) => api.post(ENDPOINTS.AUTH.LOGIN, data);
export const register = (data) => api.post(ENDPOINTS.AUTH.REGISTER, data);  // ← ADD
export const refresh = () => api.post(ENDPOINTS.AUTH.REFRESH);
export const logout = () => api.post(ENDPOINTS.AUTH.LOGOUT);
export const getProfile = () => api.get(ENDPOINTS.AUTH.PROFILE);
export const updateProfile = (data) => api.put(ENDPOINTS.AUTH.PROFILE, data);
