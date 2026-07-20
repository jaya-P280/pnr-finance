import api from "./axois";
import ENDPOINTS from "./endpoint";

export const getUsers = (params) =>
  api.get(ENDPOINTS.USERS, { params });

export const getUser = (id) => api.get(`${ENDPOINTS.USERS}/${id}`);

export const createUser = (data) => api.post(`${ENDPOINTS.USERS}`, data);

export const updateUser = (id, data) => api.put(`${ENDPOINTS.USERS}/${id}`, data);

export const updateUserStatus = (id, data) =>
  api.patch(`${ENDPOINTS.USERS}/${id}/status`, data);

export const uploadProfileImage = (id, file) => {
  const formData = new FormData();
  formData.append("profileImage", file);

  return api.patch(`${ENDPOINTS.USERS}/${id}/profile-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteUser = (id) => api.delete(`${ENDPOINTS.USERS}/${id}`); 
