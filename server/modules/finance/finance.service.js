import financeRepository from "./finance.repository.js";

class FinanceService {
  async addExpense(data, user) {
    let expenseNumber = data.expenseNumber;
    if (!expenseNumber) {
      const last = await financeRepository.getLastExpenseNo();
      const lastId = last ? parseInt(last.expense_number.replace(/\D/g, "") || "0", 10) : 0;
      expenseNumber = `EXP-${new Date().getFullYear()}-${String(lastId + 1).padStart(4, "0")}`;
    }

    const payload = {
      ...data,
      expenseNumber,
      amount: parseFloat(data.amount),
      expenseDate: data.expenseDate || new Date().toISOString().split("T")[0],
      branchId: data.branchId || user?.branch_id || 1,
      createdBy: user?.user_id || 1,
    };

    const id = await financeRepository.createExpense(payload);
    return { expense_id: id, ...payload };
  }

  async getExpenses(query) {
    const list = await financeRepository.getExpenses(query);
    const countData = await financeRepository.countExpenses(query);
    return {
      expenses: list,
      meta: {
        total: countData.total,
        totalAmount: countData.total_amount,
        page: parseInt(query.page || 1, 10),
        limit: parseInt(query.limit || 50, 10),
      },
    };
  }

  async deleteExpense(id) {
    return await financeRepository.deleteExpense(id);
  }

  async addIncome(data, user) {
    let incomeNumber = data.incomeNumber;
    if (!incomeNumber) {
      const last = await financeRepository.getLastIncomeNo();
      const lastId = last ? parseInt(last.income_number.replace(/\D/g, "") || "0", 10) : 0;
      incomeNumber = `INC-${new Date().getFullYear()}-${String(lastId + 1).padStart(4, "0")}`;
    }

    const payload = {
      ...data,
      incomeNumber,
      amount: parseFloat(data.amount),
      incomeDate: data.incomeDate || new Date().toISOString().split("T")[0],
      branchId: data.branchId || user?.branch_id || 1,
      createdBy: user?.user_id || 1,
    };

    const id = await financeRepository.createIncome(payload);
    return { income_id: id, ...payload };
  }

  async getIncome(query) {
    const list = await financeRepository.getIncome(query);
    const countData = await financeRepository.countIncome(query);
    return {
      income: list,
      meta: {
        total: countData.total,
        totalAmount: countData.total_amount,
        page: parseInt(query.page || 1, 10),
        limit: parseInt(query.limit || 50, 10),
      },
    };
  }

  async deleteIncome(id) {
    return await financeRepository.deleteIncome(id);
  }

  async getCashBook(query) {
    return await financeRepository.getCashBookLedger(query);
  }
}

export default new FinanceService();
