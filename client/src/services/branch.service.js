import * as branchApi from "../api/branch.api";

class BranchService {
  async getAll(params) {
    const { data } = await branchApi.getBranches(params);
    return {
      branches: data.data?.branches ?? [],
      pagination: data.data?.pagination ?? null,
    };
  }

  async getById(id) {
    const response = await branchApi.getBranch(id);
    return response.data.data;
  }

  async create(payload) {
    const response = await branchApi.createBranch(payload);
    return response.data;
  }

  async update(id, payload) {
    const response = await branchApi.updateBranch(id, payload);
    return response.data;
  }

  async updateStatus(id, payload) {
    const response = await branchApi.updateBranchStatus(id, payload);
    return response.data;
  }

  async delete(id) {
    const response = await branchApi.deleteBranch(id);
    return response.data;
  }
}

export default new BranchService();
