import userService from "./user.service.js";
import ApiResponse from "../../shared/ApiResponse.js";

class UserController {
    async createUser(req, res, next) {

        try {
            const user = req.user;
            const result = await userService.createUser(req.body, user);

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
                req.body
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
                req.user
            );
            return res.status(200).json({

                success: true,

                message: "User status updated successfully."

            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();