import { Router } from "express";

import authenticate from "../../modules/auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validateRequest from "../../middleware/validation.middleware.js";

import loanApplicationController from "./loanApplications.controller.js";

import {
  createLoanApplicationValidation,
  updateLoanApplicationValidation,
  getLoanApplicationValidation,
  deleteLoanApplicationValidation,
  listLoanApplicationsValidation,
  updateApplicationStatusValidation,
  rejectLoanApplicationValidation,
} from "./loanApplications.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("LOAN_APPLICATION_CREATE"),
  createLoanApplicationValidation,
  validateRequest,
  loanApplicationController.createLoanApplication
);

router.get(
  "/",
  authenticate,
  authorize("LOAN_APPLICATION_VIEW"),
  listLoanApplicationsValidation,
  validateRequest,
  loanApplicationController.getLoanApplications
);

router.get(
  "/:id",
  authenticate,
  authorize("LOAN_APPLICATION_VIEW"),
  getLoanApplicationValidation,
  validateRequest,
  loanApplicationController.getLoanApplicationById
);

router.put(
  "/:id",
  authenticate,
  authorize("LOAN_APPLICATION_UPDATE"),
  updateLoanApplicationValidation,
  validateRequest,
  loanApplicationController.updateLoanApplication
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("LOAN_APPLICATION_UPDATE"),
  updateApplicationStatusValidation,
  validateRequest,
  loanApplicationController.updateStatus
);

router.patch(
  "/:id/verify",
  authenticate,
  authorize("LOAN_APPLICATION_VERIFY"),
  getLoanApplicationValidation,
  validateRequest,
  loanApplicationController.verifyApplication
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("LOAN_APPLICATION_APPROVE"),
  getLoanApplicationValidation,
  validateRequest,
  loanApplicationController.approveApplication
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize("LOAN_APPLICATION_APPROVE"),
  rejectLoanApplicationValidation,
  validateRequest,
  loanApplicationController.rejectApplication
);

router.patch(
  "/:id/disburse",
  authenticate,
  authorize("LOAN_APPLICATION_DISBURSE"),
  getLoanApplicationValidation,
  validateRequest,
  loanApplicationController.disburseApplication
);

router.delete(
  "/:id",
  authenticate,
  authorize("LOAN_APPLICATION_DELETE"),
  deleteLoanApplicationValidation,
  validateRequest,
  loanApplicationController.deleteLoanApplication
);

export default router;