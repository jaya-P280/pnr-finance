import * as roleApi from "../api/role.api";

class RoleService {
  async getAll() {
    const { data } = await roleApi.getRoles();
    return data.data ?? [];
  }
}

export default new RoleService();
