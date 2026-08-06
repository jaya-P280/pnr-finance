import ApiError from "../shared/ApiError.js";

/**
 * Restricts data access to the user's own branch.
 * BRANCH_MANAGER, FIELD_OFFICER, ACCOUNTANT can only access their branch.
 * SUPER_ADMIN and ADMIN can access all branches.
 */
const branchScope = (req, res, next) => {
  const roleName = req.user?.role_name;

  if (roleName === "SUPER_ADMIN" || roleName === "ADMIN") {
    return next();
  }

  // For branch-level roles, inject their branch_id into the query
  if (req.user?.branch_id) {
    if (!req.query) req.query = {};
    if (!req.query.branchId) {
      req.query.branchId = req.user.branch_id;
    }
    // Also add to body for create/update operations
    if (req.method === "POST" && req.body && !req.body.branchId) {
      req.body.branchId = req.user.branch_id;
    }
  }

  next();
};

export default branchScope;