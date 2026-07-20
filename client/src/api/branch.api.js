import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getBranches = (params) => api.get(ENDPOINTS.BRANCHES, { params });
export const getBranch = (id) => api.get(`${ENDPOINTS.BRANCHES}/${id}`);
export const createBranch = (data) => api.post(ENDPOINTS.BRANCHES, data);
export const updateBranch = (id, data) => api.put(`${ENDPOINTS.BRANCHES}/${id}`, data);
export const updateBranchStatus = (id, data) =>
  api.patch(`${ENDPOINTS.BRANCHES}/${id}/status`, data);
export const deleteBranch = (id) => api.delete(`${ENDPOINTS.BRANCHES}/${id}`);
