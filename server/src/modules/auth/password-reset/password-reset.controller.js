import passwordResetService from "./password-reset.service.js";

class PasswordResetController {

    /* ==========================================================
        SET PASSWORD
    ========================================================== */

    async setupPassword(req, res, next) {

        try {

            await passwordResetService.setupPassword({

                token: req.body.token,

                password: req.body.password

            });

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

                return res.status(400).json({

                    success: false,

                    message: "Invalid or expired token."

                });

            }

            return res.status(200).json({

                success: true,

                message: "Token is valid."

            });

        }

        catch(error){

            next(error);

        }

    }

}

export default new PasswordResetController();