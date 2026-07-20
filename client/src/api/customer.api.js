import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getCustomers = (params) => api.get(ENDPOINTS.CUSTOMERS, { params });
export const getCustomer = (id) => api.get(`${ENDPOINTS.CUSTOMERS}/${id}`);
export const createCustomer = (data) => api.post(ENDPOINTS.CUSTOMERS, data);
export const updateCustomer = (id, data) => api.put(`${ENDPOINTS.CUSTOMERS}/${id}`, data);
export const updateCustomerStatus = (id, data) =>
  api.patch(`${ENDPOINTS.CUSTOMERS}/${id}/status`, data);
export const deleteCustomer = (id) => api.delete(`${ENDPOINTS.CUSTOMERS}/${id}`);
