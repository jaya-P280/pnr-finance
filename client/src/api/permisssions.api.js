import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getPermissions = (params) => api.get(ENDPOINTS.PERMISSIONS, { params });
export const getPermission = (id) => api.get(`${ENDPOINTS.PERMISSIONS}/${id}`);
export const getPermissionModules = () => api.get(`${ENDPOINTS.PERMISSIONS}/modules`);
export const getPermissionsGrouped = () => api.get(`${ENDPOINTS.PERMISSIONS}/grouped`);