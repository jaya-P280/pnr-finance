import { validationResult } from "express-validator";
import ApiError from "../shared/ApiError.js";

const validationMiddleware = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        console.log("Validation Errors:");
        console.log(errors.array());

        return next(
            new ApiError(
                400,
                "Validation Failed",
                errors.array()
            )
        );
    }

    next();
};

export default validationMiddleware;