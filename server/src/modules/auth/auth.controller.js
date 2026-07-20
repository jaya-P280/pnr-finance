import authService from "./auth.service.js";
import ApiResponse from "../../shared/ApiResponse.js";
import ApiError from "../../shared/ApiError.js";
import asyncHandler from "../../shared/asyncHandler.js";
import { getFullImageUrl } from "../../utils/url.js";
import userService from "../users/user.service.js";

class AuthController {
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const data = await authService.login(email, password, {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
    data.user.profile_image = getFullImageUrl(
      req,
      data.user.profile_image,
      "users",
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("PNRG_REFRESH_TOKEN", data.refreshToken, cookieOptions);

    return res.status(200).json(
      new ApiResponse(200, "Login Success", {
        user: data.user,
        accessToken: data.accessToken,
      }),
    );
  });

  refresh = asyncHandler(async (req, res) => {
    const refreshToken =
      req.body?.refreshToken || req.cookies?.PNRG_REFRESH_TOKEN;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

    const data = await authService.refresh(refreshToken);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("PNRG_REFRESH_TOKEN", data.refreshToken, cookieOptions);

    return res.status(200).json(
      new ApiResponse(200, "Token Refreshed", {
        accessToken: data.accessToken,
      }),
    );
  });

  logout = asyncHandler(async (req, res) => {
    const refreshToken =
      req.body?.refreshToken || req.cookies?.PNRG_REFRESH_TOKEN;

    if (refreshToken) {
      await authService.logout(refreshToken, {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }

    res.clearCookie("PNRG_REFRESH_TOKEN", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json(new ApiResponse(200, "Logout Successful"));
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.user.user_id);

    user.profile_image = getFullImageUrl(req, user.profileImage, "users");
    
    return res.status(200).json(new ApiResponse(200, "Profile", req.user));
  });
}

export default new AuthController();
