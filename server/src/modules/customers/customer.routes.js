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
  createCustomerFamilyValidation,
  updateCustomerFamilyValidation,
  deleteCustomerFamilyValidation,
  createCustomerNomineeValidation,
  updateCustomerNomineeValidation,
  deleteCustomerNomineeValidation,
} from "./customer.validation.js";

import authMiddleware from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validationMiddleware from "../../middleware/validation.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorize("CUSTOMER_CREATE"),
  createCustomerValidation,
  validationMiddleware,
  customerController.createCustomer,
);
router.get("/", authMiddleware, customerController.getCustomers);
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
  authorize("CUSTOMER_UPDATE"),
  uploadCustomerKycValidation,
  validationMiddleware,
  customerController.uploadCustomerKyc,
);
router.patch(
  "/:id/kyc/verify",
  authMiddleware,
  authorize("CUSTOMER_VERIFY"),
  verifyCustomerKycValidation,
  validationMiddleware,
  customerController.verifyCustomerKyc,
);
router.patch(
  "/:id/kyc/reject",
  authMiddleware,
  authorize("CUSTOMER_VERIFY"),
  rejectCustomerKycValidation,
  validationMiddleware,
  customerController.rejectCustomerKyc,
);

router.post(
  "/:id/family",
  authMiddleware,
  authorize("CUSTOMER_UPDATE"),
  createCustomerFamilyValidation,
  validationMiddleware,
  customerController.addFamilyMember,
);
router.get(
  "/:id/family",
  authMiddleware,
  getCustomerValidation,
  validationMiddleware,
  customerController.getFamilyMembers,
);
router.put(
  "/family/:familyId",
  authMiddleware,
  authorize("CUSTOMER_UPDATE"),
  updateCustomerFamilyValidation,
  validationMiddleware,
  customerController.updateFamilyMember,
);
router.delete(
  "/family/:familyId",
  authMiddleware,
  authorize("CUSTOMER_UPDATE"),
  deleteCustomerFamilyValidation,
  validationMiddleware,
  customerController.deleteFamilyMember,
);

router.post(
  "/:id/nominees",
  authMiddleware,
  authorize("CUSTOMER_UPDATE"),
  createCustomerNomineeValidation,
  validationMiddleware,
  customerController.addNominee,
);
router.get(
  "/:id/nominees",
  authMiddleware,
  getCustomerValidation,
  validationMiddleware,
  customerController.getNominees,
);
router.put(
  "/nominees/:nomineeId",
  authMiddleware,
  authorize("CUSTOMER_UPDATE"),
  updateCustomerNomineeValidation,
  validationMiddleware,
  customerController.updateNominee,
);
router.delete(
  "/nominees/:nomineeId",
  authMiddleware,
  authorize("CUSTOMER_UPDATE"),
  deleteCustomerNomineeValidation,
  validationMiddleware,
  customerController.deleteNominee,
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
  authorize("CUSTOMER_VERIFY"),
  customerController.getKycQueue,
);
export default router;
