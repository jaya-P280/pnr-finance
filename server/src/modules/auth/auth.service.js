import authRepository from "./auth.repository.js";
import passwordService from "./password.service.js";
import tokenService from "./token.service.js";
import ApiError from "../../shared/ApiError.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";
import auditService from "../audit/audit.service.js";
import db from "../../database/db.js";

class AuthService {
  async login(email, password, metadata) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new ApiError(401, "Invalid email or password");
    if (user.status === "PENDING") throw new ApiError(403, "Account pending approval");
    if (user.status === "INACTIVE") throw new ApiError(403, "Account is inactive");

    const permissions = await authRepository.getUserPermissions(user.user_id);
    const matched = await passwordService.compare(password, user.password_hash);
    if (!matched) throw new ApiError(401, "Invalid email or password");

    const tokenPayload = { ...user, permissions };
    const accessToken = tokenService.generateAccessToken(tokenPayload);
    const refreshToken = tokenService.generateRefreshToken(tokenPayload);
    const refreshHash = tokenService.hashRefreshToken(refreshToken);
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authRepository.saveRefreshToken(user.user_id, refreshHash, expireAt);

    delete user.password_hash;
    user.permissions = permissions;

    await auditService.log({
      userId: user.user_id,
      action: "LOGIN",
      module: "AUTH",
      description: "User logged in",
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    return { user, accessToken, refreshToken };
  }

  async register(data) {
    // Self-registration — default role is FIELD_OFFICER
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) throw new ApiError(409, "Email already registered");

    const [roleRows] = await db.execute(
      `SELECT role_id FROM roles WHERE role_name = 'FIELD_OFFICER'`,
    );
    if (!roleRows[0]) throw new ApiError(500, "Default role not configured");

    const [lastUser] = await db.execute(
      `SELECT employee_code FROM users ORDER BY user_id DESC LIMIT 1`,
    );
    const employeeCode = CodeGenerator.generate("EMP", lastUser?.employee_code, 4);

    const passwordHash = await passwordService.hash(data.password);

    const [branchRows] = await db.execute(
      `SELECT branch_id FROM branches WHERE status = 'ACTIVE' LIMIT 1`,
    );
    const branchId = data.branchId || branchRows[0]?.branch_id || null;

    await db.execute(
      `INSERT INTO users (employee_code, first_name, last_name, email, password_hash, mobile_number, role_id, branch_id, status, is_first_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 1)`,
      [
        employeeCode,
        data.firstName,
        data.lastName || null,
        data.email,
        passwordHash,
        data.mobileNumber || null,
        roleRows[0].role_id,
        branchId,
      ],
    );

    return { employeeCode, message: "Registration submitted for approval." };
  }

  async refresh(refreshToken) {
    const payload = tokenService.verifyRefreshToken(refreshToken);
    const hash = tokenService.hashRefreshToken(refreshToken);
    const stored = await authRepository.findRefreshToken(hash);
    if (!stored) throw new ApiError(401, "Invalid refresh token");

    const user = await authRepository.findUserById(payload.sub);
    const permissions = await authRepository.getUserPermissions(user.user_id);

    const tokenPayload = { ...user, permissions };
    const newAccess = tokenService.generateAccessToken(tokenPayload);
    const newRefresh = tokenService.generateRefreshToken(tokenPayload);
    const newHash = tokenService.hashRefreshToken(newRefresh);

    await authRepository.updateRefreshToken(user.user_id, newHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    return { accessToken: newAccess, refreshToken: newRefresh };
  }

  async logout(refreshToken, metadata) {
    const payload = tokenService.verifyRefreshToken(refreshToken);
    await authRepository.revokeRefreshToken(payload.sub);
    await auditService.log({
      userId: payload.sub,
      action: "LOGOUT",
      module: "AUTH",
      description: "User logged out",
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });
  }
}

export default new AuthService();