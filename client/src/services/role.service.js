import * as roleApi from "../api/role.api";

class RoleService {
  async getAll(params) {
    const { data } = await roleApi.getRoles(params);
    return {
      roles: data.data?.roles ?? [],
      pagination: data.data?.pagination ?? null,
    };
  }

  async getById(id) {
    const { data } = await roleApi.getRole(id);
    return data.data;
  }

  async create(payload) {
    const { data } = await roleApi.createRole(payload);
    return data.data;
  }

  async update(id, payload) {
    const response = await roleApi.updateRole(id, payload);
    return response.data;
  }

  async updateStatus(id, payload) {
    const response = await roleApi.updateRoleStatus(id, payload);
    return response.data;
  }

  async delete(id) {
    const response = await roleApi.deleteRole(id);
    return response.data;
  }

  async getPermissions(id) {
    const { data } = await roleApi.getRolePermissions(id);
    return data.data;
  }

  async updatePermissions(id, permissionIds) {
    const { data } = await roleApi.updateRolePermissions(id, { permissionIds });
    return data.data;
  }

  async getPermissionTree(id) {
    const { data } = await roleApi.getPermissionTree(id);
    return data.data;
  }
}

export default new RoleService();