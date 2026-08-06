import taskRepository from "./tasks.repository.js";
import ApiError from "../../shared/ApiError.js";

class TaskService {
  async getAllTasks(filters) {
    return taskRepository.getAllTasks(filters);
  }

  async getTaskById(taskId) {
    const task = await taskRepository.getTaskById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }
    return task;
  }

  async createTask(data, currentUser) {
    if (!data.task_title || data.task_title.trim() === "") {
      throw new ApiError(400, "Task title is required");
    }

    const taskPayload = {
      task_title: data.task_title.trim(),
      description: data.description,
      category: data.category || "FIELD_VISIT",
      priority: data.priority || "MEDIUM",
      status: data.status || "PENDING",
      due_date: data.due_date || null,
      assigned_to: data.assigned_to || currentUser?.user_id || null,
      branch_id: data.branch_id || currentUser?.branch_id || null,
      customer_id: data.customer_id || null,
      created_by: currentUser?.user_id || null,
    };

    return taskRepository.createTask(taskPayload);
  }

  async updateTask(taskId, data) {
    await this.getTaskById(taskId);
    return taskRepository.updateTask(taskId, data);
  }

  async updateTaskStatus(taskId, status) {
    await this.getTaskById(taskId);
    const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status provided");
    }
    return taskRepository.updateTaskStatus(taskId, status);
  }

  async deleteTask(taskId) {
    await this.getTaskById(taskId);
    return taskRepository.deleteTask(taskId);
  }

  async getTaskStats(branchId) {
    return taskRepository.getTaskStats(branchId);
  }
}

export default new TaskService();
