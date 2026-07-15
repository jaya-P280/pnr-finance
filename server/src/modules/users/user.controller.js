import userService from "./user.service.js";
import ApiResponse from "../../shared/ApiResponse.js";
import { USER_MESSAGES } from "./user.constants.js"
class UserController {
    async createUser(req, res, next) {

        try {
            const user = req.user;
            const result = await userService.createUser(req.body, user, {
                ipAddress: req.ip,
                userAgent: req.get("User-Agent")
            });

            return res.status(201).json({

                success: true,

                message:
                    "User created successfully. Password setup email has been sent.",

                data: result

            });

        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    async deleteUser(req, res, next) {

        try {

            await userService.deleteUser(

                Number(req.params.id),

                req.user, {
                ipAddress: req.ip,
                userAgent: req.get("User-Agent")
            }

            );

            return res.status(200).json({

                success: true,

                message: USER_MESSAGES.USER_DELETED

            });

        }

        catch (error) {

            next(error);

        }

    }

    async getUsers(req, res, next) {
        try {
            const result = await userService.getUsers(req.query);

            return res.status(200).json(
                new ApiResponse(
                    200,
                    "User fetched successfully",
                    result.users,
                    result.pagination
                )
            );
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req, res, next) {
        try {
            const user = await userService.getUserById(
                Number(req.params.id)
            );
            return res.status(200).json(
                new ApiResponse(
                    200,
                    "User fetched Successfully",
                    user
                )
            );
        } catch (error) {
            next(error);
        }

    }

    async updateUser(req, res, next) {
        try {
            await userService.updateUser(
                Number(req.params.id),
                req.body,
                {
                    ipAddress: req.ip,
                    userAgent: req.get("User-Agent")
                }
            );
            return res.status(200).json({
                success: true,
                message: "User updated successfully."
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUserStatus(req, res, next) {
        try {
            await userService.updateUserStatus(
                Number(req.params.id),
                req.body.status,
                req.user,
                {
                    ipAddress: req.ip,
                    userAgent: req.get("User-Agent")
                }
            );
            return res.status(200).json({

                success: true,

                message: "User status updated successfully."

            });
        } catch (error) {
            next(error);
        }
    }

    async uploadProfileImage(req, res, next) {

        try {

            if (!req.file) {

                throw new ApiError(
                    400,
                    "Profile image is required."
                );

            }

            const result =
                await userService.uploadProfileImage(

                    Number(req.params.id),

                    req.file,

                    req.user,
                    {
                        ipAddress: req.ip,
                        userAgent: req.get("User-Agent")
                    }

                );

            return res.status(200).json({

                success: true,

                message: "Profile image uploaded successfully.",

                data: result

            });

        }

        catch (error) {

            next(error);

        }

    }
}

export default new UserController();