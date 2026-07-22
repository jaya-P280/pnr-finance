import * as loanApplicationApi from "../api/loanApplication.api";

class LoanApplicationService {
  async getAll(params) {
  const { data } = await loanApplicationApi.getLoanApplications(params);
  return {
    loanApplications: data.data ?? [],
    pagination: data.meta ?? null,
  };
}

  async getById(id) {
    const response = await loanApplicationApi.getLoanApplication(id);
    return response.data.data;
  }

  async create(payload) {
    const response = await loanApplicationApi.createLoanApplication(payload);
    return response.data;
  }

  async update(id, payload) {
    const response = await loanApplicationApi.updateLoanApplication(id, payload);
    return response.data;
  }

  async updateStatus(id, payload) {
    const response = await loanApplicationApi.updateLoanApplicationStatus(id, payload);
    return response.data;
  }

  async verify(id) {
    const response = await loanApplicationApi.verifyLoanApplication(id);
    return response.data;
  }

  async approve(id, approvedAmount) {
    const response = await loanApplicationApi.approveLoanApplication(id, { approvedAmount });
    return response.data;
  }

  async reject(id, reason) {
    const response = await loanApplicationApi.rejectLoanApplication(id, { reason });
    return response.data;
  }

  async disburse(id) {
    const response = await loanApplicationApi.disburseLoanApplication(id);
    return response.data;
  }

  async delete(id) {
    const response = await loanApplicationApi.deleteLoanApplication(id);
    return response.data;
  }
}

export default new LoanApplicationService();