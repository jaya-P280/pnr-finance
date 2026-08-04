import {
  getCashBookApi,
  getExpensesApi,
  createExpenseApi,
  deleteExpenseApi,
  getIncomeApi,
  createIncomeApi,
  deleteIncomeApi,
} from "../api/finance.api";

class FinanceService {
  async getCashBook(params) {
    const response = await getCashBookApi(params);
    return response.data?.data || { entries: [], summary: {} };
  }

  async getExpenses(params) {
    const response = await getExpensesApi(params);
    return {
      expenses: response.data?.data || [],
      pagination: response.data?.meta || {},
    };
  }

  async createExpense(data) {
    const response = await createExpenseApi(data);
    return response.data?.data;
  }

  async deleteExpense(id) {
    const response = await deleteExpenseApi(id);
    return response.data;
  }

  async getIncome(params) {
    const response = await getIncomeApi(params);
    return {
      income: response.data?.data || [],
      pagination: response.data?.meta || {},
    };
  }

  async createIncome(data) {
    const response = await createIncomeApi(data);
    return response.data?.data;
  }

  async deleteIncome(id) {
    const response = await deleteIncomeApi(id);
    return response.data;
  }
}

export default new FinanceService();
