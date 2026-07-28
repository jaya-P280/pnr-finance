import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import dashboardController from "./dashboard.controller.js";

const router = Router();
router.get("/stats", authenticate, dashboardController.getStats);

export default router;