import * as customerApi from "../api/customer.api";

class CustomerService {
  async getAll(params) {
    const { data } = await customerApi.getCustomers(params);
    return {
      customers: data.data?.customers ?? [],
      pagination: data.data?.pagination ?? null,
    };
  }

  async getById(id) {
  const response = await customerApi.getCustomer(id);
  return response.data.data;
}

  async create(payload) {
    const response = await customerApi.createCustomer(payload);
    return response.data;
  }

  async update(id, payload) {
    const response = await customerApi.updateCustomer(id, payload);
    return response.data;
  }

  async updateStatus(id, payload) {
    const response = await customerApi.updateCustomerStatus(id, payload);
    return response.data;
  }

  async delete(id) {
    const response = await customerApi.deleteCustomer(id);
    return response.data;
  }
}

export default new CustomerService();
