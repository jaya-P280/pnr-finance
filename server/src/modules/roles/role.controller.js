import ApiResponse from "../../shared/ApiResponse.js";

import roleService from "./role.service.js";

class RoleController {
  async createRole(req, res, next) {
    try {
      const result = await roleService.createRole(req.body, req.user, {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      return res
        .status(201)
        .json(new ApiResponse(201, "Role created successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async getRoles(req, res, next) {
    try {
      const result = await roleService.getRoles(req.query);

      return res
        .status(200)
        .json(new ApiResponse(200, "Roles fetched successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async getRoleById(req, res, next) {
    try {
      const result = await roleService.getRoleById(Number(req.params.id));

      return res
        .status(200)
        .json(new ApiResponse(200, "Role fetched successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      await roleService.updateRole(Number(req.params.id), req.body, req.user, {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      return res
        .status(200)
        .json(new ApiResponse(200, "Role updated successfully."));
    } catch (error) {
      next(error);
    }
  }

  async updateRoleStatus(req, res, next) {
    try {
      await roleService.updateRoleStatus(
        Number(req.params.id),
        req.body.isActive,
        req.user,
        {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      );

      return res
        .status(200)
        .json(new ApiResponse(200, "Role status updated successfully."));
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    try {
      await roleService.deleteRole(Number(req.params.id), req.user, {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      return res
        .status(200)
        .json(new ApiResponse(200, "Role deleted successfully."));
    } catch (error) {
      next(error);
    }
  }

  async getRolePermissions(req, res, next) {
    try {
      const result = await roleService.getRolePermissions(
        Number(req.params.id),
      );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Role permissions fetched successfully.",
            result,
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  async updateRolePermissions(req, res, next) {
    try {
      const result = await roleService.updateRolePermissions(
        Number(req.params.id),
        req.body.permissionIds,
        req.user,
        {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Role permissions updated successfully.",
            result,
          ),
        );
    } catch (error) {
      next(error);
    }
  }
  async getPermissionTree(req, res, next) {
    try {
      const result = await roleService.getPermissionTree(Number(req.params.id));

      return res
        .status(200)
        .json(
          new ApiResponse(200, "Permission tree fetched successfully.", result),
        );
    } catch (error) {
      next(error);
    }
  }
}

export default new RoleController();
