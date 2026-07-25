import * as loanApi from "../api/loan.api";

class LoanService {
  async getAll(params) {
    const { data } = await loanApi.getLoans(params);
    return {
      loans: data.data ?? [],
      pagination: data.meta ?? null,
    };
  }

  async getById(id) {
    const response = await loanApi.getLoan(id);
    return response.data.data;
  }

  async create(payload) {
    const response = await loanApi.createLoan(payload);
    return response.data;
  }

  async update(id, payload) {
    const response = await loanApi.updateLoan(id, payload);
    return response.data;
  }

  async updateStatus(id, payload) {
    const response = await loanApi.updateLoanStatus(id, payload);
    return response.data;
  }

  async close(id) {
    const response = await loanApi.closeLoan(id);
    return response.data;
  }

  async foreclose(id) {
    const response = await loanApi.forecloseLoan(id);
    return response.data;
  }

  async markDefault(id) {
    const response = await loanApi.defaultLoan(id);
    return response.data;
  }
}

export default new LoanService();