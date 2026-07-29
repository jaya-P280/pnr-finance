import api from "./axios";
import ENDPOINTS from "./endpoint";

export const getLoanReports = (params) => api.get(`${ENDPOINTS.REPORTS}/loans`, { params });
export const getCollectionReports = (params) => api.get(`${ENDPOINTS.REPORTS}/collections`, { params });
export const getCustomerReports = (params) => api.get(`${ENDPOINTS.REPORTS}/customers`, { params });
export const getRecoveryReports = (params) => api.get(`${ENDPOINTS.REPORTS}/recovery`, { params });