import * as docsApi from "../api/customerDocument.api";

class CustomerDocumentsService {
  async getProfile(customerId) {
    const response = await docsApi.getCustomerProfile(customerId);
    return response.data.data;
  }

  async verifyKyc(customerId) {
    return (await docsApi.verifyKyc(customerId)).data;
  }

  async rejectKyc(customerId, remarks) {
    return (await docsApi.rejectKyc(customerId, { remarks })).data;
  }

  async getKycQueue(params) {
    const { data } = await docsApi.getKycQueue(params);
    return {
      rows: data.data?.rows ?? [],
      pagination: data.data?.pagination ?? null,
      counts: data.data?.counts ?? { PENDING: 0, VERIFIED: 0, REJECTED: 0 },
    };
  }
}

export default new CustomerDocumentsService();
