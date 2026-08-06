import express from "express";
import auditController from "./audit.controller.js";
import authenticate from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.use(authenticate);
// Restrict audit trail viewing to SUPER_ADMIN or ADMIN
router.use(authorize("VIEW_AUDIT_LOGS", "SYSTEM_SETTINGS"));

router.get("/", auditController.getLogs);
router.get("/stats", auditController.getStats);
router.get("/export", auditController.exportCsv);

export default router;
