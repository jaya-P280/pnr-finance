import { Router } from "express";

import validateRequest from "../../middleware/validation.middleware.js";
import authenticate from "../../modules/auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";

import loanProductController from "./loanProducts.controller.js";

import {
  createLoanProductValidation,
  updateLoanProductValidation,
  getLoanProductValidation,
  deleteLoanProductValidation,
  listLoanProductsValidation,
  updateLoanProductStatusValidation,
} from "./loanProducts.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("LOAN_PRODUCT_CREATE"),
  createLoanProductValidation,
  validateRequest,
  loanProductController.createLoanProduct,
);

router.get(
  "/",
  authenticate,
  authorize("LOAN_PRODUCT_VIEW"),
  listLoanProductsValidation,
  validateRequest,
  loanProductController.getLoanProducts,
);

router.get(
  "/:id",
  authenticate,
  authorize("LOAN_PRODUCT_VIEW"),
  getLoanProductValidation,
  validateRequest,
  loanProductController.getLoanProductById,
);

router.put(
  "/:id",
  authenticate,
  authorize("LOAN_PRODUCT_UPDATE"),
  updateLoanProductValidation,
  validateRequest,
  loanProductController.updateLoanProduct,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("LOAN_PRODUCT_UPDATE"),
  updateLoanProductStatusValidation,
  validateRequest,
  loanProductController.updateLoanProductStatus,
);

router.delete(
  "/:id",
  authenticate,
  authorize("LOAN_PRODUCT_DELETE"),
  deleteLoanProductValidation,
  validateRequest,
  loanProductController.deleteLoanProduct,
);

export default router;
