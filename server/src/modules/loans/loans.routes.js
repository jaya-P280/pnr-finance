import { Router } from "express";

import authenticate from "../auth/auth.middleware.js";

import authorize from "../../middleware/authorize.middleware.js";
import branchScope from "../../middleware/branchScope.middleware.js";
import validateRequest from "../../middleware/validation.middleware.js";

import loanController from "./loans.controller.js";

import {
  createLoanValidation,
  updateLoanValidation,
  getLoanValidation,
  deleteLoanValidation,
  listLoansValidation,
  updateLoanStatusValidation,
  closeLoanValidation,
  forecloseLoanValidation,
  defaultLoanValidation,
} from "./loans.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("LOAN_CREATE"),
  createLoanValidation,
  validateRequest,
  loanController.createLoan
);

router.get(
  "/",
  authenticate,
  authorize("LOAN_VIEW"),
  branchScope,
  listLoansValidation,
  validateRequest,
  loanController.getLoans
);

router.get(
  "/:id",
  authenticate,
  authorize("LOAN_VIEW"),
  branchScope,
  getLoanValidation,
  validateRequest,
  loanController.getLoanById
);

router.put(
  "/:id",
  authenticate,
  authorize("LOAN_UPDATE"),
  updateLoanValidation,
  validateRequest,
  loanController.updateLoan
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("LOAN_UPDATE"),
  updateLoanStatusValidation,
  validateRequest,
  loanController.updateStatus
);

router.patch(
  "/:id/close",
  authenticate,
  authorize("LOAN_CLOSE"),
  closeLoanValidation,
  validateRequest,
  loanController.closeLoan
);

router.patch(
  "/:id/foreclose",
  authenticate,
 authorize("LOAN_FORECLOSE"),
  forecloseLoanValidation,
  validateRequest,
  loanController.forecloseLoan
);

router.patch(
  "/:id/default",
  authenticate,
  authorize("LOAN_DEFAULT"),
  defaultLoanValidation,
  validateRequest,
  loanController.defaultLoan
);

router.get(
  "/:id/schedule",
  authenticate,
  authorize("LOAN_VIEW"),
  loanController.getRepaymentSchedule
);

router.post(
  "/:id/schedule/:scheduleId/send-sms",
  authenticate,
  authorize("LOAN_VIEW"),
  loanController.sendEmiReminderSms
);

router.post(
  "/send-upcoming-emi-reminders",
  authenticate,
  authorize("LOAN_VIEW"),
  loanController.sendBatchUpcomingEmiReminders
);

export default router;
