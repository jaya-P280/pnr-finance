import express from "express";
import ApiError from "../../shared/ApiError.js";
import authenticate from "../auth/auth.middleware.js";
import validateRequest from "../../middleware/validation.middleware.js";
import customerPortalController from "./customerPortal.controller.js";
import {
  createApplicationValidation,
  customerListValidation,
  customerResourceValidation,
  updateProfileValidation,
  uploadKycValidation,
} from "./customerPortal.validation.js";

import documentUpload from "../../middleware/documentUpload.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use((req, res, next) => {
  const role = (req.user?.role_name || "").toUpperCase();
  if (!["CUSTOMER", "SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER", "FIELD_OFFICER"].includes(role)) {
    next(new ApiError(403, "Customer portal access is restricted."));
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
router.get(
  "/applications/:id/contract",
  customerResourceValidation,
  validateRequest,
  customerPortalController.getLoanContract,
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
router.post("/kyc/aadhaar/generate-otp", customerPortalController.generateAadhaarOtp);
router.post("/kyc/aadhaar/verify-otp", customerPortalController.verifyAadhaarOtp);
router.post("/kyc/aadhaar/confirm", customerPortalController.confirmAadhaarKyc);
router.post("/kyc/digilocker", customerPortalController.verifyDigiLockerKyc); // Legacy/fallback
router.post("/kyc/pan", customerPortalController.verifyPanKyc);

// Documents
router.get("/documents", customerPortalController.getMyDocuments);
router.post("/documents", documentUpload, customerPortalController.uploadDocument);
router.post("/documents/upload", documentUpload, customerPortalController.uploadDocument);
router.delete("/documents/:id", customerPortalController.deleteDocument);

export default router;
