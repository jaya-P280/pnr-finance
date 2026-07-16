import authRepository from "./auth.repository.js";
import passwordService from "./password.service.js";
import tokenService from "./token.service.js";
import ApiError from "../../shared/ApiError.js";
import auditService from "../audit/audit.service.js"

class AuthService {
    async login(email, password, metadata) {
        
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            throw new ApiError(
                401,
                "Invalid Email"
            );
        }

        const permissions = await authRepository.getUserPermissions(user.user_id);

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

        const accessToken =
            tokenService.generateAccessToken({

                ...user,

                permissions

            });
        const refreshToken = tokenService.generateRefreshToken({

            ...user,

            permissions

        });
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
        user.permissions = permissions;

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

        const user = await authRepository.findUserById(payload.sub);
        const permissions =
            await authRepository.getUserPermissions(
                user.user_id
            );

        const newAccess = tokenService.generateAccessToken(...user, permissions);
        const newRefresh = tokenService.generateRefreshToken(...user, permissions);

        const newHash = tokenService.hashRefreshToken(
            newRefresh
        );

        await authRepository.updateRefreshToken(
            user.user_id,
            newHash,
            new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            )
        );

        return {
            accessToken: newAccess,
            refreshToken: newRefresh
        };

    }



    async logout(refreshToken, metadata) {
        const payload =
            tokenService.verifyRefreshToken(refreshToken);

        const hash =
            tokenService.hashRefreshToken(refreshToken);

        const stored =
            await authRepository.findRefreshToken(hash);

        if (!stored) {

            throw new ApiError(
                401,
                "Invalid Refresh Token"
            );

        }

        await authRepository.revokeRefreshToken(
            payload.sub
        );
        await auditService.log({
            userId: payload.sub,
            action: "LOGOUT_SUCCESS",
            module: "AUTH",
            description: "User logged out successfully",
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent
        });
        return;
    }
}

export default new AuthService();