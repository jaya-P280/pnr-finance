import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import ApiError from "../../shared/ApiError.js";
import customerDocumentsController from "./customerDocuments.controller.js";

const router = Router();

router.use(authenticate);

// Restrict document review to loan-approving/reviewing staff: ADMIN, BRANCH_MANAGER, FIELD_OFFICER
router.use((req, res, next) => {
  const role = (req.user?.role_name || req.user?.role || "").toUpperCase();
  if (!["ADMIN", "BRANCH_MANAGER", "FIELD_OFFICER"].includes(role)) {
    next(new ApiError(403, "Access restricted to loan review and approval staff (Admin, Branch Manager, Field Officer)."));
    return;
  }
  next();
});

router.get("/", customerDocumentsController.listDocuments);
router.get("/application/:id", customerDocumentsController.getByApplication);
router.get("/customer/:id", customerDocumentsController.getByCustomer);
router.patch("/:id/verify", customerDocumentsController.verifyDocument);
router.patch("/:id/reject", customerDocumentsController.rejectDocument);

export default router;
