import api from "./axios";
import ENDPOINTS from "./endpoint";

// Admin/Employee endpoints for managing all customers
export const getCustomers = (params) => api.get(ENDPOINTS.CUSTOMERS, { params });
export const getCustomer = (id) => api.get(`${ENDPOINTS.CUSTOMERS}/${id}`);
export const createCustomer = (data) => api.post(ENDPOINTS.CUSTOMERS, data);
export const updateCustomer = (id, data) => api.put(`${ENDPOINTS.CUSTOMERS}/${id}`, data);
export const updateCustomerStatus = (id, data) =>
  api.patch(`${ENDPOINTS.CUSTOMERS}/${id}/status`, data);
export const deleteCustomer = (id) => api.delete(`${ENDPOINTS.CUSTOMERS}/${id}`);

// Customer portal endpoints (for normal users to manage their own account)
export const customerPortalApi = {
  // Profile Management
  getMyProfile: () => api.get('/customer/profile'),
  updateMyProfile: (data) => api.put('/customer/profile', data),
  
  // Loan Applications
  createApplication: (data) => api.post('/loans/application', data),
  getMyApplications: () => api.get('/loans/my-applications'),
  getApplicationDetails: (id) => api.get(`/loans/application/${id}`),
  withdrawApplication: (id) => api.patch(`/loans/application/${id}/withdraw`),
  
  // Active Loans & Disbursement
  getMyActiveLoans: () => api.get('/loans/my-active-loans'),
  getLoanDetails: (id) => api.get(`/loans/${id}`),
  getRepaymentSchedule: (loanId) => api.get(`/loans/${loanId}/schedule`),
  getDisbursementDetails: (loanId) => api.get(`/loans/${loanId}/disbursement`),
  
  // e-KYC Services
  initiateDigilocker: () => api.post('/ekyc/digilocker/initiate'),
  checkDigilockerStatus: (transactionId) => api.get(`/ekyc/digilocker/status/${transactionId}`),
  verifyPan: (panNumber) => api.post('/ekyc/pan/verify', { panNumber }),
  getKycStatus: () => api.get('/ekyc/status'),
  uploadAadhaar: (formData) => api.post('/ekyc/aadhaar/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadPan: (formData) => api.post('/ekyc/pan/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
