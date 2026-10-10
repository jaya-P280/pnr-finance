import api from "./axios";
import ENDPOINTS from "./endpoint";

export const getAllDocuments = (params) =>
  api.get(ENDPOINTS.CUSTOMER_DOCUMENTS, { params });

export const getDocumentsByCustomer = (customerId) =>
  api.get(`${ENDPOINTS.CUSTOMER_DOCUMENTS}/customer/${customerId}`);

export const getDocumentsByApplication = (applicationId) =>
  api.get(`${ENDPOINTS.CUSTOMER_DOCUMENTS}/application/${applicationId}`);

export const verifyDocument = (id, data) =>
  api.patch(`${ENDPOINTS.CUSTOMER_DOCUMENTS}/${id}/verify`, data);

export const rejectDocument = (id, data) =>
  api.patch(`${ENDPOINTS.CUSTOMER_DOCUMENTS}/${id}/reject`, data);
