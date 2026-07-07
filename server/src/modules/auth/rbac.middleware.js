import ApiError from "../../shared/ApiError.js";

const authorization = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role_name)){
            return next(
                new ApiError(
                    403,
                    "Access Denied"
                )
            );
        }
        next();
    };
};

export default authorization;
