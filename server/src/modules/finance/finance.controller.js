import financeService from "./finance.service.js";
import ApiResponse from "../../shared/ApiResponse.js";

class FinanceController {
  // Expenses
  getExpenses = async (req, res, next) => {
    try {
      const result = await financeService.getExpenses(req.query);
      res.json(new ApiResponse(200, "Expenses fetched successfully.", result.expenses, result.meta));
    } catch (error) {
      next(error);
    }
  };

  addExpense = async (req, res, next) => {
    try {
      const result = await financeService.addExpense(req.body, req.user);
      res.status(201).json(new ApiResponse(201, "Expense created successfully.", result));
    } catch (error) {
      next(error);
    }
  };

  deleteExpense = async (req, res, next) => {
    try {
      await financeService.deleteExpense(req.params.id);
      res.json(new ApiResponse(200, "Expense deleted successfully."));
    } catch (error) {
      next(error);
    }
  };

  // Income
  getIncome = async (req, res, next) => {
    try {
      const result = await financeService.getIncome(req.query);
      res.json(new ApiResponse(200, "Income records fetched successfully.", result.income, result.meta));
    } catch (error) {
      next(error);
    }
  };

  addIncome = async (req, res, next) => {
    try {
      const result = await financeService.addIncome(req.body, req.user);
      res.status(201).json(new ApiResponse(201, "Income created successfully.", result));
    } catch (error) {
      next(error);
    }
  };

  deleteIncome = async (req, res, next) => {
    try {
      await financeService.deleteIncome(req.params.id);
      res.json(new ApiResponse(200, "Income deleted successfully."));
    } catch (error) {
      next(error);
    }
  };

  // Cash Book
  getCashBook = async (req, res, next) => {
    try {
      const result = await financeService.getCashBook(req.query);
      res.json(new ApiResponse(200, "Cash book fetched successfully.", result));
    } catch (error) {
      next(error);
    }
  };
}

export default new FinanceController();
