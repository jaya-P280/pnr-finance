import ApiResponse from "../../shared/ApiResponse.js";

import permissionService from "./permission.service.js";

class PermissionController {

  async getPermissions(req, res, next) {

    try {

      const result =
        await permissionService.getPermissions(
          req.query
        );

      return res.status(200).json(
        new ApiResponse(
          200,
          "Permissions fetched successfully.",
          result
        )
      );

    } catch (error) {
      next(error);
    }

  }

  async getPermissionById(req, res, next) {

    try {

      const result =
        await permissionService.getPermissionById(
          Number(req.params.id)
        );

      return res.status(200).json(
        new ApiResponse(
          200,
          "Permission fetched successfully.",
          result
        )
      );

    } catch (error) {
      next(error);
    }

  }

  async getPermissionModules(req, res, next) {

    try {

      const result =
        await permissionService.getPermissionModules();

      return res.status(200).json(
        new ApiResponse(
          200,
          "Permission modules fetched successfully.",
          result
        )
      );

    } catch (error) {
      next(error);
    }

  }

  async getPermissionsGrouped(req, res, next) {

    try {

      const result =
        await permissionService.getPermissionsGrouped();

      return res.status(200).json(
        new ApiResponse(
          200,
          "Permissions grouped successfully.",
          result
        )
      );

    } catch (error) {
      next(error);
    }

  }

}

export default new PermissionController();