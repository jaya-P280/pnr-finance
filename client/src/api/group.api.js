import api from "./axios";
import ENDPOINTS from "./endpoint";

export const getGroups = (params) => api.get(ENDPOINTS.GROUPS, { params });
export const getGroup = (id) => api.get(`${ENDPOINTS.GROUPS}/${id}`);
export const createGroup = (payload) => api.post(ENDPOINTS.GROUPS, payload);
export const updateGroup = (id, payload) => api.put(`${ENDPOINTS.GROUPS}/${id}`, payload);
export const deleteGroup = (id) => api.delete(`${ENDPOINTS.GROUPS}/${id}`);
export const addGroupMember = (id, payload) => api.post(`${ENDPOINTS.GROUPS}/${id}/members`, payload);
export const removeGroupMember = (id, customerId) => api.delete(`${ENDPOINTS.GROUPS}/${id}/members/${customerId}`);
export const getGroupAttendance = (id, params) => api.get(`${ENDPOINTS.GROUPS}/${id}/attendance`, { params });
export const recordAttendance = (id, payload) => api.post(`${ENDPOINTS.GROUPS}/${id}/attendance`, payload);