import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getLoans = (params) => api.get(ENDPOINTS.LOANS, { params });
export const getLoan = (id) => api.get(`${ENDPOINTS.LOANS}/${id}`);
export const createLoan = (payload) => api.post(ENDPOINTS.LOANS, payload);
export const updateLoan = (id, payload) =>
  api.put(`${ENDPOINTS.LOANS}/${id}`, payload);
export const updateLoanStatus = (id, payload) =>
  api.patch(`${ENDPOINTS.LOANS}/${id}/status`, payload);
export const closeLoan = (id) => api.patch(`${ENDPOINTS.LOANS}/${id}/close`);
export const forecloseLoan = (id) =>
  api.patch(`${ENDPOINTS.LOANS}/${id}/foreclose`);
export const defaultLoan = (id) =>
  api.patch(`${ENDPOINTS.LOANS}/${id}/default`);
