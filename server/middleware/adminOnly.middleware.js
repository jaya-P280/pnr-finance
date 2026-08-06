import ApiError from "../shared/ApiError.js";

export default function adminOnly(req, res, next) {
  if (req.user?.role_name !== "ADMIN") {
    return next(new ApiError(403, "Company settings can only be accessed by an Admin."));
  }

  next();
}
