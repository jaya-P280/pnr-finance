import userService from "./user.service.js";
import ApiResponse from "../../shared/ApiResponse.js";
import asyncHandler from "../../shared/asyncHandler.js";
import { getFullImageUrl } from "../../utils/url.js";

class UserController {
  createUser = asyncHandler(async (req, res) => {
    const result = await userService.createUser(req.body, req.user);
    res.status(201).json(new ApiResponse(201, "User created.", result));
  });

  getUsers = asyncHandler(async (req, res) => {
    const result = await userService.getUsers(req.query, req.user);
    res.json(new ApiResponse(200, "Users fetched.", result.users, result.pagination));
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    user.profile_image = getFullImageUrl(req, user.profile_image, "users");
    res.json(new ApiResponse(200, "User fetched.", user));
  });

  updateUser = asyncHandler(async (req, res) => {
    await userService.updateUser(req.params.id, req.body, req.user);
    res.json(new ApiResponse(200, "User updated."));
  });

  updateUserStatus = asyncHandler(async (req, res) => {
    await userService.updateUserStatus(req.params.id, req.body.status, req.user);
    res.json(new ApiResponse(200, "User status updated."));
  });

  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id, req.user);
    res.json(new ApiResponse(200, "User deleted."));
  });
}

export default new UserController();
