import ApiError from "../../shared/ApiError.js";
import PaginationHelper from "../../shared/pagination.helper.js";

import permissionRepository from "./permission.repository.js";

class PermissionService {

  async getPermissions(query) {

    const { page, limit } =
      PaginationHelper.build(query);

    const filters = {

      page,

      limit,

      search:
        query.search?.trim() || null,

      moduleName:
        query.moduleName || null,

      sortBy:
        query.sortBy || "module_name",

      sortOrder:
        query.sortOrder || "ASC",

    };

    const permissions =
      await permissionRepository.findAll(
        filters
      );

    return {
      permissions,
    };

  }

  async getPermissionById(
    permissionId
  ) {

    const permission =
      await permissionRepository.findById(
        permissionId
      );

    if (!permission) {
      throw new ApiError(
        404,
        "Permission not found."
      );
    }

    return permission;

  }

  async getPermissionModules() {

    return await permissionRepository.getModules();

  }

  async getPermissionsGrouped() {

    return await permissionRepository.getPermissionsGrouped();

  }

}

export default new PermissionService();