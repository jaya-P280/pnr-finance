import api from "./axios";
import ENDPOINTS from "./endpoint";

export const getCustomers = (params) =>
  api.get(ENDPOINTS.CUSTOMERS, { params });
export const getCustomer = (id) =>
  api.get(`${ENDPOINTS.CUSTOMERS}/${id}`);
export const createCustomer = (data) =>
  api.post(ENDPOINTS.CUSTOMERS, data);
export const updateCustomer = (id, data) =>
  api.put(`${ENDPOINTS.CUSTOMERS}/${id}`, data);
export const updateCustomerStatus = (id, data) =>
  api.patch(`${ENDPOINTS.CUSTOMERS}/${id}/status`, data);
export const deleteCustomer = (id) =>
  api.delete(`${ENDPOINTS.CUSTOMERS}/${id}`);
export const uploadProfileImage = (id, formData) =>
  api.post(`${ENDPOINTS.CUSTOMERS}/${id}/profile-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const uploadCustomerKyc = (id, data) =>
  api.post(`${ENDPOINTS.CUSTOMERS}/${id}/kyc`, data);
export const verifyCustomerKyc = (id, data) =>
  api.patch(`${ENDPOINTS.CUSTOMERS}/${id}/kyc/verify`, data);
export const rejectCustomerKyc = (id, data) =>
  api.patch(`${ENDPOINTS.CUSTOMERS}/${id}/kyc/reject`, data);
export const getKycQueue = (params) =>
  api.get(`${ENDPOINTS.CUSTOMERS}/kyc/queue`, { params });

export const getCustomerProfile = (customerId) =>
  api.get(`${ENDPOINTS.CUSTOMERS}/${customerId}/profile`);

const customerPortal = ENDPOINTS.CUSTOMER_PORTAL;

export const customerPortalApi = {
  getMyProfile: () => api.get(`${customerPortal}/profile`),
  updateMyProfile: (data) => api.put(`${customerPortal}/profile`, data),

  getLoanProducts: () => api.get(ENDPOINTS.LOAN_PRODUCTS),
  applyForLoan: (data) => api.post(`${customerPortal}/applications`, data),
  getMyApplications: (params) =>
    api.get(`${customerPortal}/applications`, { params }),
  getApplicationDetails: (id) =>
    api.get(`${customerPortal}/applications/${id}`),
  withdrawApplication: (id, data = {}) =>
    api.patch(`${customerPortal}/applications/${id}/withdraw`, data),

  getMyActiveLoans: (params) =>
    api.get(`${customerPortal}/loans`, { params }),
  getLoanDetails: (id) => api.get(`${customerPortal}/loans/${id}`),
  getRepaymentSchedule: (loanId) =>
    api.get(`${customerPortal}/loans/${loanId}/schedule`),
  getDisbursementDetails: (loanId) =>
    api.get(`${customerPortal}/loans/${loanId}/disbursement`),

  getKycStatus: () => api.get(`${customerPortal}/kyc/status`),
  verifyDigiLockerKyc: (data) =>
    api.post(`${customerPortal}/kyc/digilocker`, data),
  verifyPanKyc: (data) =>
    api.post(`${customerPortal}/kyc/pan`, data),
};
