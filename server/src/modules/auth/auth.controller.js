import authService from "./auth.service.js"
import ApiResponse from "../../shared/ApiResponse.js"
import asyncHandler from "../../shared/asyncHandler.js"

class AuthController{
    login = asyncHandler(
        async (req,res) => {
            const {
                email,
                password
            } = req.body;

            const data = await authService.login(
                email,
                password
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
}

export default new AuthController();