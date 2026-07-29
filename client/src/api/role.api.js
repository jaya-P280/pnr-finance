import api from "./axios";
import ENDPOINTS from "./endpoint";

export const getRoles = (params) => api.get(ENDPOINTS.ROLES, { params });
export const getRole = (id) => api.get(`${ENDPOINTS.ROLES}/${id}`);
export const createRole = (payload) => api.post(ENDPOINTS.ROLES, payload);
export const updateRole = (id, payload) => api.put(`${ENDPOINTS.ROLES}/${id}`, payload);
export const updateRoleStatus = (id, payload) => api.patch(`${ENDPOINTS.ROLES}/${id}/status`, payload);
export const deleteRole = (id) => api.delete(`${ENDPOINTS.ROLES}/${id}`);
export const getRolePermissions = (id) => api.get(`${ENDPOINTS.ROLES}/${id}/permissions`);
export const updateRolePermissions = (id, payload) => api.put(`${ENDPOINTS.ROLES}/${id}/permissions`, payload);
export const getPermissionTree = (id) => api.get(`${ENDPOINTS.ROLES}/${id}/permission-tree`);