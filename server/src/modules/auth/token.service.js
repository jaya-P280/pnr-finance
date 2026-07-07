import jwt from "jsonwebtoken"
import crypto from 'crypto'
import env from "../../config/env.js"

class TokenService {
    generateAccessToken(user){
        return jwt.sign(
            {
                sub:user.user_id,
                roleId: user.role_id,
                branchId: user.branch_id,
                type:"access"
            },
            env.JWT.ACCESS_SECRET,
            {
                expiresIn: env.JWT.ACCESS_EXPIRES
            }
        );
    }

    generateRefreshToken(user){
        return jwt.sign(
            {
                sub:user.user_id,
                type: "refresh"
            },
            env.JWT.REFRESH_SECRET,
            {
                expiresIn:env.JWT.REFRESH_EXPIRES
            }
        );
    }

    verifyAccessToken(token){

        return jwt.verify(
            token,
            env.JWT.ACCESS_SECRET
        );
    }

    hashRefreshToken(refreshToken){
        return crypto
                .createHash("sha256")
                .update(refreshToken)
                .digest("hex");
    }


}

export default new TokenService();