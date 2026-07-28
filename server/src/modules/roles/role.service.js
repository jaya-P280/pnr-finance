import ApiError from "../../shared/ApiError.js";
import PaginationHelper from "../../shared/pagination.helper.js";
import auditService from "../audit/audit.service.js";

import roleRepository from "./role.repository.js";

import { ROLE_MESSAGES, PROTECTED_ROLES } from "./roles.constants.js";

class RoleService {
  async createRole(data, currentUser, metadata) {
    const connection = await roleRepository.beginTransaction();

    try {
      const exists = await roleRepository.existsByName(
        connection,
        data.roleName,
      );

      if (exists) {
        throw new ApiError(409, ROLE_MESSAGES.ROLE_EXISTS);
      }

      const roleId = await roleRepository.create(connection, {
        roleName: data.roleName.trim(),

        roleDescription: data.roleDescription || null,

        isActive: data.isActive ?? true,
      });

      await roleRepository.commit(connection);

      await auditService.log({
        userId: currentUser.user_id,

        action: "CREATE",

        module: "ROLE",

        description: `Role ${data.roleName} created.`,

        ipAddress: metadata.ipAddress,

        userAgent: metadata.userAgent,
      });

      return {
        roleId,
      };
    } catch (error) {
      await roleRepository.rollback(connection);

      throw error;
    }
  }

  async getRoles(query) {
    const { page, limit } = PaginationHelper.build(query);

    const filters = {
      page,

      limit,

      search: query.search?.trim() || null,

      status: query.status !== undefined ? Number(query.status) : null,

      sortBy: query.sortBy || "role_name",

      sortOrder: query.sortOrder || "ASC",
    };

    const roles = await roleRepository.findAll(filters);

    const totalRecords = await roleRepository.count(filters);

    return {
      roles,

      pagination: PaginationHelper.metadata(page, limit, totalRecords),
    };
  }

  async getRoleById(roleId) {
    const role = await roleRepository.findById(roleId);

    if (!role) {
      throw new ApiError(404, ROLE_MESSAGES.NOT_FOUND);
    }

    const permissions = await roleRepository.getRolePermissions(roleId);

    return {
      role,

      permissions,
    };
  }
  async updateRole(roleId, data, currentUser, metadata) {
    const connection = await roleRepository.beginTransaction();

    try {
      const role = await roleRepository.findById(roleId);

      if (!role) {
        throw new ApiError(404, ROLE_MESSAGES.NOT_FOUND);
      }

      if (role.role_name.toUpperCase() !== data.roleName.trim().toUpperCase()) {
        const exists = await roleRepository.existsByName(
          connection,
          data.roleName,
        );

        if (exists) {
          throw new ApiError(409, ROLE_MESSAGES.ROLE_EXISTS);
        }
      }

      await roleRepository.update(connection, {
        roleId,

        roleName: data.roleName.trim(),

        roleDescription: data.roleDescription || null,

        isActive: data.isActive ?? role.is_active,
      });

      await roleRepository.commit(connection);

      await auditService.log({
        userId: currentUser.user_id,

        action: "UPDATE",

        module: "ROLE",

        description: `Role ${data.roleName} updated.`,

        ipAddress: metadata.ipAddress,

        userAgent: metadata.userAgent,
      });
    } catch (error) {
      await roleRepository.rollback(connection);

      throw error;
    }
  }

  async updateRoleStatus(roleId, isActive, currentUser, metadata) {
    const connection = await roleRepository.beginTransaction();

    try {
      const role = await roleRepository.findById(roleId);

      if (!role) {
        throw new ApiError(404, ROLE_MESSAGES.NOT_FOUND);
      }

      if (PROTECTED_ROLES.includes(role.role_name.toUpperCase()) && !isActive) {
        throw new ApiError(400, ROLE_MESSAGES.CANNOT_DEACTIVATE);
      }

      await roleRepository.updateStatus(connection, roleId, isActive);

      await roleRepository.commit(connection);

      await auditService.log({
        userId: currentUser.user_id,

        action: "STATUS_UPDATE",

        module: "ROLE",

        description: `${role.role_name} status changed to ${
          isActive ? "ACTIVE" : "INACTIVE"
        }.`,

        ipAddress: metadata.ipAddress,

        userAgent: metadata.userAgent,
      });
    } catch (error) {
      await roleRepository.rollback(connection);

      throw error;
    }
  }

  async deleteRole(roleId, currentUser, metadata) {
    const connection = await roleRepository.beginTransaction();

    try {
      const role = await roleRepository.findById(roleId);

      if (!role) {
        throw new ApiError(404, ROLE_MESSAGES.NOT_FOUND);
      }

      if (PROTECTED_ROLES.includes(role.role_name.toUpperCase())) {
        throw new ApiError(400, ROLE_MESSAGES.CANNOT_DELETE);
      }

      await roleRepository.delete(connection, roleId);

      await roleRepository.commit(connection);

      await auditService.log({
        userId: currentUser.user_id,

        action: "DELETE",

        module: "ROLE",

        description: `Role ${role.role_name} deleted.`,

        ipAddress: metadata.ipAddress,

        userAgent: metadata.userAgent,
      });
    } catch (error) {
      await roleRepository.rollback(connection);

      throw error;
    }
  }
  async getRolePermissions(roleId) {
    const role = await roleRepository.findById(roleId);

    if (!role) {
      throw new ApiError(404, ROLE_MESSAGES.NOT_FOUND);
    }

    const permissions = await roleRepository.getRolePermissions(roleId);

    return {
      role,
      permissions,
    };
  }

  async updateRolePermissions(roleId, permissionIds, currentUser, metadata) {
    const connection = await roleRepository.beginTransaction();

    try {
      const role = await roleRepository.findById(roleId);

      if (!role) {
        throw new ApiError(404, ROLE_MESSAGES.NOT_FOUND);
      }

      if (!Array.isArray(permissionIds)) {
        throw new ApiError(400, "Permission list is required.");
      }

      const uniquePermissionIds = [...new Set(permissionIds)];

      const availablePermissionIds = await roleRepository.getPermissionIds();

      const invalidPermissions = uniquePermissionIds.filter(
        (permissionId) => !availablePermissionIds.includes(permissionId),
      );

      if (invalidPermissions.length) {
        throw new ApiError(400, "One or more permissions are invalid.");
      }

      await roleRepository.replaceRolePermissions(
        connection,
        roleId,
        uniquePermissionIds,
      );

      await roleRepository.commit(connection);

      await auditService.log({
        userId: currentUser.user_id,

        action: "UPDATE",

        module: "ROLE_PERMISSION",

        description: `Permissions updated for role ${role.role_name}.`,

        ipAddress: metadata.ipAddress,

        userAgent: metadata.userAgent,
      });

      const permissions = await roleRepository.getRolePermissions(roleId);

      return {
        role,
        permissions,
      };
    } catch (error) {
      await roleRepository.rollback(connection);

      throw error;
    }
  }
  async getPermissionTree(roleId) {
    const role = await roleRepository.findById(roleId);

    if (!role) {
      throw new ApiError(404, ROLE_MESSAGES.NOT_FOUND);
    }

    const rows = await roleRepository.getPermissionTree(roleId);

    const modules = {};

    rows.forEach((permission) => {
      if (!modules[permission.module_name]) {
        modules[permission.module_name] = [];
      }

      modules[permission.module_name].push({
        permissionId: permission.permission_id,

        permissionName: permission.permission_name,

        description: permission.description,

        selected: Boolean(permission.selected),
      });
    });

    return {
      role,

      modules: Object.keys(modules).map((moduleName) => ({
        moduleName,
        permissions: modules[moduleName],
      })),
    };
  }
}

export default new RoleService();
