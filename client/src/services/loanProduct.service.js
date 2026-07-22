import * as loanProductApi from "../api/loanProduct.api";

class LoanProductService {
  async getAll(params) {
    const { data } = await loanProductApi.getLoanProducts(params);
    return {
      loanProducts: data?.data ?? [],
      pagination: data?.meta ?? null,
    };
  }

  async getById(id) {
    const response = await loanProductApi.getLoanProduct(id);
    return response.data.data;
  }

  async create(payload) {
    const response = await loanProductApi.createLoanProduct(payload);
    return response.data;
  }

  async update(id, payload) {
    const response = await loanProductApi.updateLoanProduct(id, payload);
    return response.data;
  }

  async updateStatus(id, payload) {
    const response = await loanProductApi.updateLoanProductStatus(id, payload);
    return response.data;
  }

  async delete(id) {
    const response = await loanProductApi.deleteLoanProduct(id);
    return response.data;
  }
}

export default new LoanProductService();