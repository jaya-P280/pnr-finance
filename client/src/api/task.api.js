import axiosInstance from "./axios";

export const getTasks = (params) => axiosInstance.get("/tasks", { params });
export const getTaskStats = (params) => axiosInstance.get("/tasks/stats", { params });
export const getTask = (id) => axiosInstance.get(`/tasks/${id}`);
export const createTask = (data) => axiosInstance.post("/tasks", data);
export const updateTask = (id, data) => axiosInstance.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id, status) =>
  axiosInstance.patch(`/tasks/${id}/status`, { status });
export const deleteTask = (id) => axiosInstance.delete(`/tasks/${id}`);
