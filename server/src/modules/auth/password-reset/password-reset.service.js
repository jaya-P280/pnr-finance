import crypto from "crypto";
import env from "../../../config/env.js";
import userRepository from "../../users/user.repository.js";
import passwordResetRepository from "./password-reset.repository.js";
import ApiError from "../../../shared/ApiError.js";
import passwordService from "../../auth/password.service.js";
import auditService from "../../audit/audit.service.js";

class PasswordResetService {
  generateToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  /* ==========================================================
        HASH TOKEN
    ========================================================== */

  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  getExpiry(hours = 24) {
    const expiry = new Date();

    expiry.setHours(expiry.getHours() + hours);

    return expiry;
  }

  async createAccountSetupToken(connection, user) {
    await passwordResetRepository.invalidateUserTokens(
      connection,

      user.userId,

      "ACCOUNT_SETUP",
    );

    const rawToken = this.generateToken();

    const tokenHash = this.hashToken(rawToken);

    const expiresAt = this.getExpiry(24);

    await passwordResetRepository.createToken(
      connection,

      {
        userId: user.userId,

        tokenHash,

        purpose: "ACCOUNT_SETUP",

        expiresAt,
      },
    );

    return {
      rawToken,

      setupLink: `${env.APP_URL}/setup-password?token=${rawToken}`,
    };
  }

  /* ==========================================================
        VERIFY TOKEN
    ========================================================== */

  async verifyToken(rawToken) {
    const tokenHash = this.hashToken(rawToken);

    return await passwordResetRepository.findValidToken(tokenHash);
  }

  async setupPassword({ token, password }, metadata) {
    const connection = await userRepository.beginTransaction();

    try {
      const tokenHash = this.hashToken(token);

      const resetToken =
        await passwordResetRepository.findValidToken(tokenHash);

      if (!resetToken) {
        throw new ApiError(400, "Invalid or expired password setup Link.");
      }
      const passwordHash = await passwordService.hash(password);
      await userRepository.updatePassword(
        connection,
        resetToken.user_id,
        passwordHash,
      );

      await passwordResetRepository.markTokenUsed(
        connection,
        resetToken.token_id,
      );
      await userRepository.commit(connection);

      await auditService.log({
        userId: resetToken.user_id,
        action: "PASSWORD_SETUP",
        module: "AUTH",
        description: `Password Created Successfully`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });
    } catch (error) {
      await userRepository.rollback(connection);

      throw error;
    }
  }
}

export default new PasswordResetService();
