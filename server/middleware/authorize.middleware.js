import ApiError from "../shared/ApiError.js";

/**
 // Normalize permission strings to uppercase with underscores
 */
const normalizePermission = (perm) => {
  if (!perm) return "";
  return String(perm).toUpperCase().replace(/\./g, "_");
};

const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    const roleName = (req.user.role_name || "").toUpperCase();
    if (roleName === "ADMIN" || roleName === "SUPER_ADMIN") {
      return next();
    }

    const userPermissions = (req.user.permissions || []).map(normalizePermission);
    const normRequired = permissions.map(normalizePermission);

    const hasPermission = normRequired.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return next(
        new ApiError(
          403,
          `Access forbidden. Required permission: ${permissions.join(" OR ")}`
        )
      );
    }

    next();
  };
};

export default authorize;
