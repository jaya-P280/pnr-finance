import ApiError from "../shared/ApiError.js";

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(
                new ApiError(401, "Authentication required.")
            );
        }

        const userRole = req.user.role_name;

        if (!allowedRoles.includes(userRole)) {
            return next(
                new ApiError(401,
                    "You are Not Authorize to access this resource."
                )
            );
        }
        next();
    }
}

export default authorize;