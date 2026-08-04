import express from "express";
import financeController from "./finance.controller.js";
import authenticate from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.use(authenticate);

// Cash book
router.get("/cashbook", authorize("FINANCE_VIEW"), financeController.getCashBook);

// Expenses
router.get("/expenses", authorize("FINANCE_VIEW"), financeController.getExpenses);
router.post("/expenses", authorize("FINANCE_CREATE"), financeController.addExpense);
router.delete("/expenses/:id", authorize("FINANCE_DELETE"), financeController.deleteExpense);

// Income
router.get("/income", authorize("FINANCE_VIEW"), financeController.getIncome);
router.post("/income", authorize("FINANCE_CREATE"), financeController.addIncome);
router.delete("/income/:id", authorize("FINANCE_DELETE"), financeController.deleteIncome);

export default router;
