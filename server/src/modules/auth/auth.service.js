import authRepository from "./auth.repository.js";
import passwordService from "./password.service.js";
import tokenService from "./token.service.js";
import ApiError from "../../shared/ApiError.jssh ";

class AuthService {
    async login(email, password,metadata) {
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

        if (!matched) {
            throw new ApiError(
                401,
                "Invalid Password"
            );
        }

        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = tokenService.generateRefreshToken(user);
        const refreshHash = tokenService.hashRefreshToken(refreshToken);
        const expireAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await authRepository.saveRefreshToken(
            user.user_id,
            refreshHash,
            expireAt
        );

        delete user.password_hash;

        await auditService.log({
            userId: user.user_id,
            action: "LOGIN_SUCCESS",
            module: "AUTH",
            description: "User logged in successfully",
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent
        });

        return {
            user,
            accessToken,
            refreshToken
        };
    }

    async refresh(refreshToken) {
        const payload = tokenService.verifyRefreshToken(refreshToken);

        const hash = tokenService.hashRefreshToken(refreshToken);

        const stored = await authRepository.findRefreshToken(hash);

        if (!stored) {
            throw new ApiError(
                401,
                "Refresh Token is Invalid"
            );
        }

        const user = await authRepository.findUserById(payload.user_id);

        const newAccess = tokenService.generateAccessToken(user);
        const newRefresh = tokenService.generateRefreshToken(user);

        await authRepository.revokeRefreshToken(hash);

        const newHash = tokenService.hashRefreshToken(
            newRefresh
        );

        await authRepository.saveRefreshToken(
            user.user_id,
            newHash,
            new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            )
        );

        return {
            accessToken: newAccess,
            refreshToken: newHash
        };

    }



    async logout(refreshToken,metadata) {
        const hash = tokenService.hashRefreshToken(refreshToken);
        await authRepository.revokeRefreshToken(hash);
        await auditService.log({
            userId: user.user_id,
            action: "LOGIN_SUCCESS",
            module: "AUTH",
            description: "User logged in successfully",
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent
        });
        return;
    }
}

export default new AuthService();