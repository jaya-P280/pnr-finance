import ApiError from "../shared/ApiError.js";

const authorize = (...requiredPermissions) => {

    return (req, res, next) => {

        if (!req.user) {

            return next(
                new ApiError(
                    401,
                    "Authentication required."
                )
            );

        }

        if (
            req.user.roleName === "SUPER_ADMIN" || requiredPermissions.includes("SUPER_ADMIN")
        ) {

            return next();

        }

        const permissions =
            req.user.permissions || [];

        console.log(permissions)

        const hasPermission =
            requiredPermissions.every(permission =>
                permissions.includes(permission)
            );

        if (!hasPermission) {

            return next(

                new ApiError(

                    403,

                    "You do not have permission to perform this action."

                )

            );

        }

        next();

    };

};

export default authorize;