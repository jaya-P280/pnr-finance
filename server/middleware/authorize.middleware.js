import ApiError from "../shared/ApiError.js";

const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    const roleName = req.user.role_name;

    // --- SUPER_ADMIN and ADMIN have full access (bypass all permission checks) ---
    if (roleName === "SUPER_ADMIN" || roleName === "ADMIN") {
      return next();
    }

    // --- SUPER_ADMIN gets NO bypass — only what's in their permissions ---
    const permissions = req.user.permissions || [];

    const hasAll = requiredPermissions.every((p) => permissions.includes(p));

    if (!hasAll) {
      return next(new ApiError(403, "You do not have permission to perform this action."));
    }

    next();
  };
};

export default authorize;