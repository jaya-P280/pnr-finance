import express from "express";
import ApiError from "../../shared/ApiError.js";
import authenticate from "../auth/auth.middleware.js";
import kycUpload from "../../middleware/kycUpload.middleware.js";
import validateRequest from "../../middleware/validation.middleware.js";
import customerPortalController from "./customerPortal.controller.js";
import {
  createApplicationValidation,
  customerListValidation,
  customerResourceValidation,
  updateProfileValidation,
  uploadKycValidation,
} from "./customerPortal.validation.js";

const router = express.Router();

router.use(authenticate);
router.use((req, res, next) => {
  if (req.user.role_name !== "CUSTOMER") {
    next(new ApiError(403, "Customer portal access is restricted to customers."));
    return;
  }
  next();
});

router.get("/profile", customerPortalController.getMyProfile);
router.put(
  "/profile",
  updateProfileValidation,
  validateRequest,
  customerPortalController.updateMyProfile,
);

router.post(
  "/applications",
  createApplicationValidation,
  validateRequest,
  customerPortalController.createApplication,
);
router.get(
  "/applications",
  customerListValidation,
  validateRequest,
  customerPortalController.getMyApplications,
);
router.get(
  "/applications/:id",
  customerResourceValidation,
  validateRequest,
  customerPortalController.getApplicationDetails,
);
router.patch(
  "/applications/:id/withdraw",
  customerResourceValidation,
  validateRequest,
  customerPortalController.withdrawApplication,
);

router.get(
  "/loans",
  customerListValidation,
  validateRequest,
  customerPortalController.getMyLoans,
);
router.get(
  "/loans/:id",
  customerResourceValidation,
  validateRequest,
  customerPortalController.getLoanDetails,
);
router.get(
  "/loans/:id/schedule",
  customerResourceValidation,
  validateRequest,
  customerPortalController.getRepaymentSchedule,
);
router.get(
  "/loans/:id/disbursement",
  customerResourceValidation,
  validateRequest,
  customerPortalController.getDisbursementDetails,
);

router.get("/kyc/status", customerPortalController.getKycStatus);
router.post(
  "/kyc",
  kycUpload,
  uploadKycValidation,
  validateRequest,
  customerPortalController.uploadKycDocument,
);

export default router;
