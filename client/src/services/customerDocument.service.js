import * as docsApi from "../api/customerDocument.api";

class CustomerDocumentsService {
  async getProfile(customerId) {
    const response = await docsApi.getCustomerProfile(customerId);
    return response.data.data;
  }

  async uploadKyc(customerId, formData) {
    return (await docsApi.uploadKyc(customerId, formData)).data;
  }
  async verifyKyc(customerId) {
    return (await docsApi.verifyKyc(customerId)).data;
  }
  async rejectKyc(customerId, remarks) {
    return (await docsApi.rejectKyc(customerId, { remarks })).data;
  }

  async addFamilyMember(customerId, payload) {
    return (await docsApi.addFamilyMember(customerId, payload)).data;
  }
  async updateFamilyMember(familyId, payload) {
    return (await docsApi.updateFamilyMember(familyId, payload)).data;
  }
  async deleteFamilyMember(familyId) {
    return (await docsApi.deleteFamilyMember(familyId)).data;
  }

  async addNominee(customerId, payload) {
    return (await docsApi.addNominee(customerId, payload)).data;
  }
  async updateNominee(nomineeId, payload) {
    return (await docsApi.updateNominee(nomineeId, payload)).data;
  }
  async deleteNominee(nomineeId) {
    return (await docsApi.deleteNominee(nomineeId)).data;
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
