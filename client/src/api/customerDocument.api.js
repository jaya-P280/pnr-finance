import api from "./axios";
import ENDPOINTS from "./endpoint";

const base = (id) => `${ENDPOINTS.CUSTOMERS}/${id}`;

export const getCustomerProfile = (id) => api.get(`${base(id)}/profile`);
export const verifyKyc = (id) => api.patch(`${base(id)}/kyc/verify`);
export const rejectKyc = (id, payload) => api.patch(`${base(id)}/kyc/reject`, payload);
export const getKycQueue = (params) => api.get(`${ENDPOINTS.CUSTOMERS}/kyc/queue`, { params });