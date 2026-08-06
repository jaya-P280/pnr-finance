import authService from "./auth.service.js";
import userService from "../users/user.service.js";
import ApiResponse from "../../shared/ApiResponse.js";
import ApiError from "../../shared/ApiError.js";
import asyncHandler from "../../shared/asyncHandler.js";
import { getFullImageUrl } from "../../shared/imageUrl.helper.js";

class AuthController {
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const data = await authService.login(email, password, {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.cookie("PNRG_REFRESH_TOKEN", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json(
      new ApiResponse(200, "Login Successful", {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }),
    );
  });

  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body, {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
    return res.status(201).json(
      new ApiResponse(201, "Customer registration successful.", result),
    );
  });

  refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.body?.refreshToken || req.cookies?.PNRG_REFRESH_TOKEN;
    if (!refreshToken) throw new ApiError(401, "Refresh token is required");

    const data = await authService.refresh(refreshToken);

    res.cookie("PNRG_REFRESH_TOKEN", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json(new ApiResponse(200, "Token Refreshed", {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }));
  });

  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.body?.refreshToken || req.cookies?.PNRG_REFRESH_TOKEN;
    if (refreshToken) {
      await authService.logout(refreshToken, {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    }

    res.clearCookie("PNRG_REFRESH_TOKEN", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json(new ApiResponse(200, "Logout Successful"));
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.user.user_id);
    user.profile_image = getFullImageUrl(req, user.profile_image, "users");
    return res.status(200).json(new ApiResponse(200, "Profile fetched", user));
  });

  updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.user_id, req.body);
    user.profile_image = getFullImageUrl(req, user.profile_image, "users");
    return res.status(200).json(new ApiResponse(200, "Profile updated", user));
  });
}

export default new AuthController();
