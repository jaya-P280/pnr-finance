import passwordResetService from "./password-reset.service.js";
import ApiError from "../../../shared/ApiError.js";

class PasswordResetController {

    /* ==========================================================
        SET PASSWORD
    ========================================================== */

    async setupPassword(req, res, next) {

        try {

            await passwordResetService.setupPassword({

                token: req.body.token,

                password: req.body.password

            },
                {
                    ipAddress: req.ip,
                    userAgent: req.get("User-Agent")
                }
            );

            return res.status(200).json({

                success: true,

                message: "Password created successfully."

            });

        }

        catch (error) {

            next(error);

        }

    }

    /* ==========================================================
        VERIFY TOKEN
    ========================================================== */

    async verifyToken(req, res, next) {

        try {

            const token =
                await passwordResetService.verifyToken(
                    req.params.token
                );

            if (!token) {

                throw new ApiError(

                    400,

                    "Invalid or expired password setup link."

                );

            }

            return res.status(200).json({

                success: true,

                message: "Token is valid."

            });

        }

        catch (error) {

            next(error);

        }

    }

}

export default new PasswordResetController();