import api from "./axios";
import ENDPOINTS from "./endpoint";

const base = (id) => `${ENDPOINTS.CUSTOMERS}/${id}`;

export const getCustomerProfile = (id) => api.get(`${base(id)}/profile`);

export const uploadKyc = (id, formData) =>
  api.post(`${base(id)}/kyc`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const verifyKyc = (id) => api.patch(`${base(id)}/kyc/verify`);
export const rejectKyc = (id, payload) => api.patch(`${base(id)}/kyc/reject`, payload);

export const addFamilyMember = (id, payload) => api.post(`${base(id)}/family`, payload);
export const updateFamilyMember = (familyId, payload) => api.put(`${ENDPOINTS.CUSTOMERS}/family/${familyId}`, payload);
export const deleteFamilyMember = (familyId) => api.delete(`${ENDPOINTS.CUSTOMERS}/family/${familyId}`);

export const addNominee = (id, payload) => api.post(`${base(id)}/nominees`, payload);
export const updateNominee = (nomineeId, payload) => api.put(`${ENDPOINTS.CUSTOMERS}/nominees/${nomineeId}`, payload);
export const deleteNominee = (nomineeId) => api.delete(`${ENDPOINTS.CUSTOMERS}/nominees/${nomineeId}`);
export const getKycQueue = (params) => api.get(`${ENDPOINTS.CUSTOMERS}/kyc/queue`, { params });