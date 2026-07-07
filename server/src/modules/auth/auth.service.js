import authRepository from "./auth.repository";
import passwordService from "./password.service";
import tokenService from "./token.service";
import ApiError from "../../shared/ApiError";

class AuthService {
    async login(email, password) {
        const user = await authRepository.findUserByEmail(
            email
        );

        if (!user) {
            throw new ApiError(
                401,
                "Invalid Email"
            );
        }

        const matched = await passwordService.compare(
            password,
            user.password_hash
        );

        if(!matched){
            throw new ApiError(
                401,
                "Invalid Password"
            );
        }

        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = tokenService.generateRefreshToken(user);
        const refreshHash = tokenService.hashRefreshToken(refreshToken); 
        const expireAt = new Date(
            Date.now()+7*24*60*60*1000
        );

        await authRepository.saveRefreshToken(
            user.user_id,
            refreshHash,
            expireAt
        );

        delete user.password_hash;

        return {
            user,
            accessToken,
            refreshToken
        };
    }
}

export default new AuthService();