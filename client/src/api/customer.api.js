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
  generateAadhaarOtp: (data) =>
    api.post(`${customerPortal}/kyc/aadhaar/generate-otp`, data),
  verifyAadhaarOtp: (data) =>
    api.post(`${customerPortal}/kyc/aadhaar/verify-otp`, data),
  confirmAadhaarKyc: (data) =>
    api.post(`${customerPortal}/kyc/aadhaar/confirm`, data),
  verifyDigiLockerKyc: (data) =>
    api.post(`${customerPortal}/kyc/digilocker`, data),
  verifyPanKyc: (data) =>
    api.post(`${customerPortal}/kyc/pan`, data),
  sendEmiReminderSms: (loanId, scheduleId) =>
    api.post(`${ENDPOINTS.LOANS}/${loanId}/schedule/${scheduleId}/send-sms`),

  getMyDocuments: () => api.get(`${customerPortal}/documents`),
  uploadDocument: (formData) =>
    api.post(`${customerPortal}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteDocument: (id) => api.delete(`${customerPortal}/documents/${id}`),
  getLoanContract: (applicationId) =>
    api.get(`${customerPortal}/applications/${applicationId}/contract`),
};
