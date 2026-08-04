import * as taskApi from "../api/task.api";

class TaskService {
  async getAll(params) {
    const response = await taskApi.getTasks(params);
    return response.data?.data || [];
  }

  async getStats(params) {
    const response = await taskApi.getTaskStats(params);
    return response.data?.data || { total: 0, pending: 0, in_progress: 0, completed: 0, urgent: 0 };
  }

  async getById(id) {
    const response = await taskApi.getTask(id);
    return response.data?.data;
  }

  async create(payload) {
    const response = await taskApi.createTask(payload);
    return response.data;
  }

  async update(id, payload) {
    const response = await taskApi.updateTask(id, payload);
    return response.data;
  }

  async updateStatus(id, status) {
    const response = await taskApi.updateTaskStatus(id, status);
    return response.data;
  }

  async delete(id) {
    const response = await taskApi.deleteTask(id);
    return response.data;
  }
}

export default new TaskService();
