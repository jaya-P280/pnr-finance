import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getLoanApplications = (params) =>
  api.get(ENDPOINTS.LOAN_APPLICATIONS, { params });
export const getLoanApplication = (id) =>
  api.get(`${ENDPOINTS.LOAN_APPLICATIONS}/${id}`);
export const createLoanApplication = (payload) =>
  api.post(ENDPOINTS.LOAN_APPLICATIONS, payload);
export const updateLoanApplication = (id, payload) =>
  api.put(`${ENDPOINTS.LOAN_APPLICATIONS}/${id}`, payload);
export const updateLoanApplicationStatus = (id, payload) =>
  api.patch(`${ENDPOINTS.LOAN_APPLICATIONS}/${id}/status`, payload);
export const verifyLoanApplication = (id) =>
  api.patch(`${ENDPOINTS.LOAN_APPLICATIONS}/${id}/verify`);
export const approveLoanApplication = (id, payload) =>
  api.patch(`${ENDPOINTS.LOAN_APPLICATIONS}/${id}/approve`, payload);
export const rejectLoanApplication = (id, payload) =>
  api.patch(`${ENDPOINTS.LOAN_APPLICATIONS}/${id}/reject`, payload);
export const disburseLoanApplication = (id) =>
  api.patch(`${ENDPOINTS.LOAN_APPLICATIONS}/${id}/disburse`);
export const deleteLoanApplication = (id) =>
  api.delete(`${ENDPOINTS.LOAN_APPLICATIONS}/${id}`);
