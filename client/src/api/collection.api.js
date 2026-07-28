import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getCollections = (params) => api.get(ENDPOINTS.COLLECTIONS, { params });
export const getCollection = (id) => api.get(`${ENDPOINTS.COLLECTIONS}/${id}`);
export const createCollection = (payload) => api.post(ENDPOINTS.COLLECTIONS, payload);
export const updateCollection = (id, payload) => api.put(`${ENDPOINTS.COLLECTIONS}/${id}`, payload);
export const deleteCollection = (id) => api.delete(`${ENDPOINTS.COLLECTIONS}/${id}`);
export const getCollectionSummary = (params) => api.get(`${ENDPOINTS.COLLECTIONS}/summary`, { params });