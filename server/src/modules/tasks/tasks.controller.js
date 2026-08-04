import taskService from "./tasks.service.js";
import ApiResponse from "../../shared/ApiResponse.js";
import asyncHandler from "../../shared/asyncHandler.js";

class TaskController {
  getAllTasks = asyncHandler(async (req, res) => {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      category: req.query.category,
      search: req.query.search,
      assignedTo: req.query.assignedTo,
      branchId: req.query.branchId,
    };
    const tasks = await taskService.getAllTasks(filters);
    res.json(new ApiResponse(200, "Tasks fetched successfully", tasks));
  });

  getTaskById = asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id);
    res.json(new ApiResponse(200, "Task fetched successfully", task));
  });

  createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body, req.user);
    res.status(201).json(new ApiResponse(201, "Task created successfully", task));
  });

  updateTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json(new ApiResponse(200, "Task updated successfully", task));
  });

  updateTaskStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const task = await taskService.updateTaskStatus(req.params.id, status);
    res.json(new ApiResponse(200, "Task status updated successfully", task));
  });

  deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.params.id);
    res.json(new ApiResponse(200, "Task deleted successfully", null));
  });

  getTaskStats = asyncHandler(async (req, res) => {
    const branchId = req.query.branchId || null;
    const stats = await taskService.getTaskStats(branchId);
    res.json(new ApiResponse(200, "Task stats fetched successfully", stats));
  });
}

export default new TaskController();
