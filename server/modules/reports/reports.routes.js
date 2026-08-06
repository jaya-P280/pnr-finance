import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import branchScope from "../../middleware/branchScope.middleware.js";
import reportsController from "./reports.controller.js";

const router = Router();

router.get("/loans", authenticate, branchScope, authorize("REPORT_VIEW"), reportsController.loanReport);
router.get("/collections", authenticate, branchScope, authorize("REPORT_VIEW"), reportsController.collectionReport);
router.get("/customers", authenticate, branchScope, authorize("REPORT_VIEW"), reportsController.customerReport);
router.get("/recovery", authenticate, branchScope, authorize("REPORT_VIEW"), reportsController.recoveryReport);

export default router;
