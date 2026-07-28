import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getCompanyProfile = () => api.get(`${ENDPOINTS.SETTINGS}/company`);
export const updateCompanyProfile = (payload) => api.put(`${ENDPOINTS.SETTINGS}/company`, payload);
export const getSystemSettings = () => api.get(`${ENDPOINTS.SETTINGS}/system`);
export const updateSystemSettings = (payload) => api.put(`${ENDPOINTS.SETTINGS}/system`, payload);