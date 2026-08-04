import express from "express";
import authenticate from "../auth/auth.middleware.js";
import taskController from "./tasks.controller.js";
import authorize from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/stats", authorize("TASK_VIEW"), taskController.getTaskStats);
router.get("/", authorize("TASK_VIEW"), taskController.getAllTasks);
router.post("/", authorize("TASK_CREATE"), taskController.createTask);
router.get("/:id", authorize("TASK_VIEW"), taskController.getTaskById);
router.put("/:id", authorize("TASK_UPDATE"), taskController.updateTask);
router.patch("/:id/status", authorize("TASK_UPDATE"), taskController.updateTaskStatus);
router.delete("/:id", authorize("TASK_DELETE"), taskController.deleteTask);

export default router;
