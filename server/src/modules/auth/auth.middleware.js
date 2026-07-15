import jwt from "jsonwebtoken"
import env from "../../config/env.js"
import ApiError from "../../shared/ApiError.js"
import authRepository from "./auth.repository.js"

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new ApiError(
                401,
                "Authorization header missing"
            );
        }
        if (!authHeader.startsWith("Bearer ")) {
            throw new ApiError(
                401,
                "Invalid authorization format"
            );
        }

        const token = authHeader.split(" ")[1];

        const decode = jwt.verify(
            token,
            env.JWT.ACCESS_SECRET
        );
        const user = await authRepository.findUserById(
            decode.sub
        );

        if (!user) {
            throw new ApiError(
                401,
                "User not Found"
            );
        }
        req.user = {
            ...user,
            permissions: decode.permissions
        };
        next();
    } catch (error) {
        next(error);
    }
};

export default authenticate;