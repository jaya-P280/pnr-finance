import ApiError from "../shared/ApiError.js";

const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    const roleName = req.user.role_name;

    // --- ADMIN and SUPER_ADMIN have full access (bypass all permission checks) ---
    if (roleName === "ADMIN" || roleName === "SUPER_ADMIN") {
      return next();
    }

    const permissions = (req.user.permissions || []).map((p) =>
      String(p).toUpperCase().replace(/\./g, "_")
    );
    const normRequired = requiredPermissions.map((p) =>
      String(p).toUpperCase().replace(/\./g, "_")
    );

    const hasAll = normRequired.every((p) => permissions.includes(p));

    if (!hasAll) {
      return next(new ApiError(403, "You do not have permission to perform this action."));
    }

    next();
  };
};

export default authorize;