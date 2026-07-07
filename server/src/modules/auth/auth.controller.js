import authService from "./auth.service.js"
import ApiResponse from "../../shared/ApiResponse.js"
import asyncHandler from "../../shared/asyncHandler.js"

class AuthController {
    login = asyncHandler(
        async (req, res) => {
            const {
                email,
                password
            } = req.body;

            const data = await authService.login(
                email,
                password,
                {
                    ipAddress: req.ip,
                    userAgent: req.get("User-Agent")
                }
            );

            return res.status(200).json(
                new ApiResponse(
                    200,
                    "Login Success",
                    data
                )
            );
        }
    );

    refresh = asyncHandler(
        async (req, res) => {
            const { refreshToken } = req.body;

            const data = await authService.refresh(refreshToken);

            return res.status(200).json(
                new ApiResponse(
                    200,
                    "Token Refreshed",
                    data
                )
            );
        }
    );

    logout = asyncHandler(
        async (req, res) => {
            const { refreshToken } = req.body;
            await authService.logout(
                refreshToken, 
                {
                    ipAddress: req.ip,
                    userAgent: req.get("User-Agent")
                }
            );
            res.status(200).json(
                new ApiResponse(
                    200,
                    "Logout Successful"
                )
            );
        }
    );


    getProfile = asyncHandler(
        async (req, res) => {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    "Profile",
                    req.user
                )
            );
        }
    );
}

export default new AuthController();