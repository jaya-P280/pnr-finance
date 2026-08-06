import express from "express";
import authenticate from "../auth/auth.middleware.js";
import taskController from "./tasks.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/stats", taskController.getTaskStats);
router.get("/", taskController.getAllTasks);
router.post("/", taskController.createTask);
router.get("/:id", taskController.getTaskById);
router.put("/:id", taskController.updateTask);
router.patch("/:id/status", taskController.updateTaskStatus);
router.delete("/:id", taskController.deleteTask);

export default router;
