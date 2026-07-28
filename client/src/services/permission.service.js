import * as permissionApi from "../api/permisssions.api";

class PermissionService {
  async getAll(params) {
    const { data } = await permissionApi.getPermissions(params);
    return data.data?.permissions ?? [];
  }

  async getGrouped() {
    const { data } = await permissionApi.getPermissionsGrouped();
    return data.data ?? [];
  }

  async getModules() {
    const { data } = await permissionApi.getPermissionModules();
    return (data.data ?? []).map((m) => m.module_name);
  }
}

export default new PermissionService();