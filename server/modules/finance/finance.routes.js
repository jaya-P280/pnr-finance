import express from "express";
import financeController from "./finance.controller.js";
import authenticate from "../auth/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

// Cash book
router.get("/cashbook", financeController.getCashBook);

// Expenses
router.get("/expenses", financeController.getExpenses);
router.post("/expenses", financeController.addExpense);
router.delete("/expenses/:id", financeController.deleteExpense);

// Income
router.get("/income", financeController.getIncome);
router.post("/income", financeController.addIncome);
router.delete("/income/:id", financeController.deleteIncome);

export default router;
