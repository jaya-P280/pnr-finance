import * as userApi from "../api/user.api";

class UserService {
  async getAll(params) {
    const { data } = await userApi.getUsers(params);
    return {
      users: data.data ?? [],
      pagination: data.meta ?? null,
    };
  }

  async getById(id) {
    const { data } = await userApi.getUser(id);
    return data.data;
  }

  async create(payload) {
    const { data } = await userApi.createUser(payload);
    return data;
  }

  async update(id, payload) {
    console.log(payload,id)
    const { data } = await userApi.updateUser(id, payload);
    return data;
  }

  async updateStatus(id, payload) {
    const { data } = await userApi.updateUserStatus(id, payload);
    return data;
  }

  async uploadProfileImage(id, file) {
    const { data } = await userApi.uploadProfileImage(id, file);
    return data;
  }

  async delete(id) {
    const { data } = await userApi.deleteUser(id);
    return data;
  }
}

export default new UserService();
