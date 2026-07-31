import authRepository from "./auth.repository.js";
import passwordService from "./password.service.js";
import tokenService from "./token.service.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";
import ApiError from "../../shared/ApiError.js";
import auditService from "../audit/audit.service.js";

class AuthService {
  async login(email, password, metadata) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new ApiError(401, "Invalid email or password");

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
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) throw new ApiError(409, "Email already registered.");

    // All SQL queries go to repository — service only coordinates
    const role = await authRepository.findDefaultCustomerRole();
    if (!role) throw new ApiError(500, "Default role not configured.");

    const lastUser = await authRepository.getLastEmployeeCode();
    const employeeCode = CodeGenerator.generate(
      "EMP",
      lastUser?.employee_code,
      4,
    );

    const branch = await authRepository.getDefaultBranch();
    const branchId = data.branchId || branch?.branch_id || null;

    const passwordHash = await passwordService.hash(data.password);

    await authRepository.createUser({
      employeeCode,
      firstName: data.firstName,
      lastName: data.lastName || null,
      email: data.email,
      passwordHash,
      mobileNumber: data.mobileNumber || null,
      roleId: role.role_id,
      branchId,
    });

    return {
      employeeCode,
      message: "Registration Successful",
    };
  }

  async updateProfile(userId, data) {
    const user = await authRepository.updateOwnProfile(userId, data);
    if (!user) throw new ApiError(404, "User not found.");
    return user;
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

    await authRepository.updateRefreshToken(
      user.user_id,
      newHash,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

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
