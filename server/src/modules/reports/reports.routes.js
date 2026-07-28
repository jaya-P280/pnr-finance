import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import reportsController from "./reports.controller.js";

const router = Router();

router.get("/loans", authenticate, authorize("REPORT_VIEW"), reportsController.loanReport);
router.get("/collections", authenticate, authorize("REPORT_VIEW"), reportsController.collectionReport);
router.get("/customers", authenticate, authorize("REPORT_VIEW"), reportsController.customerReport);
router.get("/recovery", authenticate, authorize("REPORT_VIEW"), reportsController.recoveryReport);

export default router;