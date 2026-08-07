import api from "./axios";
import ENDPOINTS from "./endpoint";

export const markAttendance = (data) => api.post(ENDPOINTS.ATTENDANCE, data);
export const getAttendance = (params) => api.get(ENDPOINTS.ATTENDANCE, { params });
export const getAttendanceSummary = (params) => api.get(`${ENDPOINTS.ATTENDANCE}/summary`, { params });
