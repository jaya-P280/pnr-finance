import { validationResult } from "express-validator";
import ApiError from "../shared/ApiError";

const validationMiddleware = (req,res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return next(
            new ApiError(
                400,
                "validation Failed",
                errors.array()
            )
        )
    }
    next();
}

export default validationMiddleware;