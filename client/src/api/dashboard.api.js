import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getDashboardStats = (params) => api.get(`${ENDPOINTS.DASHBOARD}/stats`, { params });