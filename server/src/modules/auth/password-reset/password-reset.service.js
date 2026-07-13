import crypto from "crypto";

import env from "../../../config/env.js";

import passwordResetRepository from "./password-reset.repository.js";

class PasswordResetService {

    /* ==========================================================
        GENERATE RANDOM TOKEN
    ========================================================== */

    generateToken() {

        return crypto
            .randomBytes(32)
            .toString("hex");

    }

    /* ==========================================================
        HASH TOKEN
    ========================================================== */

    hashToken(token) {

        return crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

    }

    /* ==========================================================
        TOKEN EXPIRY
    ========================================================== */

    getExpiry(hours = 24) {

        const expiry = new Date();

        expiry.setHours(
            expiry.getHours() + hours
        );

        return expiry;

    }

    /* ==========================================================
        CREATE ACCOUNT SETUP TOKEN

        NOTE:
        No Transaction Handling Here.
        Caller owns the transaction.
    ========================================================== */

    async createAccountSetupToken(connection, user) {

        await passwordResetRepository.invalidateUserTokens(

            connection,

            user.userId,

            "ACCOUNT_SETUP"

        );

        const rawToken =
            this.generateToken();

        const tokenHash =
            this.hashToken(rawToken);

        const expiresAt =
            this.getExpiry(24);

        await passwordResetRepository.createToken(

            connection,

            {

                userId: user.userId,

                tokenHash,

                purpose: "ACCOUNT_SETUP",

                expiresAt

            }

        );

        return {

            rawToken,

            setupLink:
                `${env.APP_URL}/setup-password?token=${rawToken}`

        };

    }

    /* ==========================================================
        VERIFY TOKEN
    ========================================================== */

    async verifyToken(rawToken) {

        const tokenHash =
            this.hashToken(rawToken);

        return await passwordResetRepository
            .findValidToken(tokenHash);

    }

}

export default new PasswordResetService();