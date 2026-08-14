import express from "express";

import customerController from "./customer.controller.js";

import {
  createCustomerValidation,
  getCustomerValidation,
  updateCustomerValidation,
  updateCustomerStatusValidation,
  deleteCustomerValidation,
  uploadCustomerKycValidation,
  verifyCustomerKycValidation,
  rejectCustomerKycValidation,
} from "./customer.validation.js";

import authMiddleware from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import branchScope from "../../middleware/branchScope.middleware.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
import profileImageUpload from "../../middleware/profileImageUpload.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorize("CUSTOMER_CREATE"),
  createCustomerValidation,
  validationMiddleware,
  customerController.createCustomer,
);
router.get("/", authMiddleware, authorize("CUSTOMER_VIEW"), branchScope, customerController.getCustomers);
router.get(
  "/:id",
  authMiddleware,
  getCustomerValidation,
  validationMiddleware,
  customerController.getCustomerById,
);
router.put(
  "/:id",
  authMiddleware,
  authorize("CUSTOMER_UPDATE"),
  updateCustomerValidation,
  validationMiddleware,
  customerController.updateCustomer,
);
router.patch(
  "/:id/status",
  authMiddleware,
  authorize("CUSTOMER_UPDATE"),
  updateCustomerStatusValidation,
  validationMiddleware,
  customerController.updateCustomerStatus,
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("CUSTOMER_DELETE"),
  deleteCustomerValidation,
  validationMiddleware,
  customerController.deleteCustomer,
);

router.post(
  "/:id/kyc",
  authMiddleware,
  authorize("CUSTOMER_VIEW"),
  branchScope,
  validationMiddleware,
  customerController.uploadCustomerKyc,
);
router.patch(
  "/:id/kyc/verify",
  authMiddleware,
  authorize("CUSTOMER_VIEW"),
  authorize("CUSTOMER_KYC_VERIFY"),
  verifyCustomerKycValidation,
  validationMiddleware,
  customerController.verifyCustomerKyc,
);
router.patch(
  "/:id/kyc/reject",
  authMiddleware,
  authorize("CUSTOMER_VIEW"),
  authorize("CUSTOMER_KYC_VERIFY"),
  rejectCustomerKycValidation,
  validationMiddleware,
  customerController.rejectCustomerKyc,
);

router.post(
  "/:id/profile-image",
  authMiddleware,
  authorize("CUSTOMER_UPDATE"),
  profileImageUpload,
  customerController.uploadProfileImage,
);

router.get(
  "/:id/profile",
  authMiddleware,
  getCustomerValidation,
  validationMiddleware,
  customerController.getCustomerProfile,
);

router.get(
  "/kyc/queue",
  authMiddleware,
  authorize("CUSTOMER_KYC_VIEW"),
  customerController.getKycQueue,
);
export default router;
