import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getLoanProducts = (params) =>
  api.get(ENDPOINTS.LOAN_PRODUCTS, { params });
export const getLoanProduct = (id) =>
  api.get(`${ENDPOINTS.LOAN_PRODUCTS}/${id}`);
export const createLoanProduct = (payload) =>
  api.post(ENDPOINTS.LOAN_PRODUCTS, payload);
export const updateLoanProduct = (id, payload) =>
  api.put(`${ENDPOINTS.LOAN_PRODUCTS}/${id}`, payload);
export const updateLoanProductStatus = (id, payload) =>
  api.patch(`${ENDPOINTS.LOAN_PRODUCTS}/${id}/status`, payload);
export const deleteLoanProduct = (id) =>
  api.delete(`${ENDPOINTS.LOAN_PRODUCTS}/${id}`);
