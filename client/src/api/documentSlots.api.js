import api from "./axios";
import ENDPOINTS from "./endpoint";

export const getDocumentSlots = (params) =>
  api.get(ENDPOINTS.DOCUMENT_SLOTS, { params });

export const createDocumentSlot = (data) =>
  api.post(ENDPOINTS.DOCUMENT_SLOTS, data);

export const updateDocumentSlot = (id, data) =>
  api.put(`${ENDPOINTS.DOCUMENT_SLOTS}/${id}`, data);

export const deleteDocumentSlot = (id) =>
  api.delete(`${ENDPOINTS.DOCUMENT_SLOTS}/${id}`);
