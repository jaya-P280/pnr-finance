import api from "./axois";
import ENDPOINTS from "./endpoint";

export const login = (data) => api.post(ENDPOINTS.AUTH.LOGIN, data);
export const refresh = () => api.post(ENDPOINTS.AUTH.REFRESH);
export const logout = () => api.post(ENDPOINTS.AUTH.LOGOUT);
export const getProfile = () => api.get(ENDPOINTS.AUTH.PROFILE);
