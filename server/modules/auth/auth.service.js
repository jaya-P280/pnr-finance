import authRepository from "./auth.repository.js";
import passwordService from "./password.service.js";
import tokenService from "./token.service.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";
import ApiError from "../../shared/ApiError.js";
import auditService from "../audit/audit.service.js";
import attendanceRepository from "../attendance/attendance.repository.js";
import logger from "../../config/logger.js";

class AuthService {
  async login(identifier, password, metadata = {}) {
    const cleanIdentifier = identifier ? String(identifier).trim() : "";
    const cleanPassword = password ? String(password).trim() : "";

    if (!cleanIdentifier) throw new ApiError(400, "Email address or Mobile number is required.");

    const user = await authRepository.findUserByIdentifier(cleanIdentifier);
    if (!user) throw new ApiError(401, "Invalid email/mobile number or password.");
    if (user.status !== "ACTIVE") throw new ApiError(403, "Your account is inactive or suspended. Please contact administrator.");

    const permissions = await authRepository.getUserPermissions(user.user_id);
    const matched = await passwordService.compare(cleanPassword, user.password_hash);
    if (!matched) throw new ApiError(401, "Invalid email/mobile number or password.");

    const tokenPayload = { ...user, permissions };
    const accessToken = tokenService.generateAccessToken(tokenPayload);
    const refreshToken = tokenService.generateRefreshToken(tokenPayload);
    const refreshHash = tokenService.hashRefreshToken(refreshToken);
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authRepository.saveRefreshToken(user.user_id, refreshHash, expireAt);

    delete user.password_hash;
    user.permissions = permissions;

    // Auto-mark attendance on login for staff/employees at their admin-selected location
    if (user.role_name && user.role_name.toUpperCase() !== "CUSTOMER") {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const existingAtt = await attendanceRepository.findRecord(user.user_id, todayStr);
        if (!existingAtt) {
          const nowTimeStr = new Date().toTimeString().split(" ")[0];
          const locationName = user.branch_name ? `${user.branch_name} (${user.branch_code || "Branch"})` : "Assigned Branch Location";
          await attendanceRepository.markAttendance({
            userId: user.user_id,
            branchId: user.branch_id,
            attendanceDate: todayStr,
            clockIn: nowTimeStr,
            status: "PRESENT",
            remarks: `Auto-marked PRESENT on login at ${locationName}`,
            recordedBy: user.user_id,
          });
        }
      } catch (attErr) {
        logger.error("Auto attendance on login failed:", attErr);
      }
    }

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

  async register(data, metadata = {}) {
    let cleanEmail = data.email ? String(data.email).trim().toLowerCase() : "";
    const cleanMobile = data.mobileNumber ? String(data.mobileNumber).trim() : "";
    const cleanAadhaar = data.aadhaarNumber ? String(data.aadhaarNumber).trim() : null;
    const cleanPan = data.panNumber ? String(data.panNumber).trim().toUpperCase() : null;

    if (!cleanEmail && !cleanMobile) {
      throw new ApiError(400, "Please provide an Email address or Mobile number.");
    }

    // Auto-generate a clean placeholder email if user registers with mobile only
    if (!cleanEmail && cleanMobile) {
      const sanitizedMobile = cleanMobile.replace(/\D/g, "").slice(-10);
      cleanEmail = `${sanitizedMobile}@pnrgfinance.local`;
    }

    // 1. Check duplicate Email
    if (cleanEmail) {
      const existingUser = await authRepository.findUserByEmail(cleanEmail);
      if (existingUser) throw new ApiError(409, "Email address is already registered.");
    }

    // 2. Check duplicate Mobile
    if (cleanMobile) {
      const existingUserMobile = await authRepository.findUserByMobile(cleanMobile);
      const existingCustMobile = await authRepository.findCustomerByMobile(cleanMobile);
      if (existingUserMobile || existingCustMobile) {
        throw new ApiError(409, "Mobile number is already registered.");
      }
    }

    // 3. Check duplicate Aadhaar
    if (cleanAadhaar) {
      const existingAadhaar = await authRepository.findCustomerByAadhaar(cleanAadhaar);
      if (existingAadhaar) {
        throw new ApiError(409, "Aadhaar number is already registered.");
      }
    }

    // 4. Check duplicate PAN
    if (cleanPan) {
      const existingPan = await authRepository.findCustomerByPan(cleanPan);
      if (existingPan) {
        throw new ApiError(409, "PAN number is already registered.");
      }
    }

    // All registered users via public portal receive the CUSTOMER role
    const role = await authRepository.findDefaultCustomerRole();
    if (!role) throw new ApiError(500, "Default customer role not configured.");

    const lastUser = await authRepository.getLastEmployeeCode();
    const employeeCode = CodeGenerator.generate(
      "CUST",
      lastUser?.employee_code,
      4,
    );

    const branch = await authRepository.getDefaultBranch();
    const branchId = data.branchId || branch?.branch_id || 1;

    const passwordHash = await passwordService.hash(data.password);

    const userId = await authRepository.createUser({
      employeeCode,
      firstName: data.firstName,
      lastName: data.lastName || null,
      email: cleanEmail,
      passwordHash,
      mobileNumber: cleanMobile || null,
      roleId: role.role_id,
      branchId,
    });

    // Automatically populate customers table and KYC record
    const lastCust = await authRepository.getLastCustomerCode();
    const customerCode = CodeGenerator.generate("CUST", lastCust?.customer_code, 4);
    const customerId = await authRepository.createCustomerRecord({
      customerCode,
      branchId: branchId || 1,
      firstName: data.firstName,
      lastName: data.lastName || null,
      mobileNumber: cleanMobile || "0000000000",
      email: cleanEmail,
      aadhaarNumber: cleanAadhaar,
      panNumber: cleanPan,
      createdBy: userId,
    });

    await auditService.log({
      userId,
      roleName: "CUSTOMER",
      branchId: branchId || 1,
      customerId,
      action: "CUSTOMER_SELF_REGISTER",
      module: "AUTH",
      description: `Customer self-registered account for ${cleanEmail}`,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    return {
      employeeCode,
      customerCode,
      message: "Customer Registration Successful. Account created and pending KYC verification.",
    };
  }

  async updateProfile(userId, data) {
    const user = await authRepository.updateOwnProfile(userId, data);
    if (!user) throw new ApiError(404, "User not found.");
    return user;
  }

  async refresh(refreshToken) {
    if (!refreshToken) throw new ApiError(401, "Refresh token required");
    const payload = tokenService.verifyRefreshToken(refreshToken);
    const hash = tokenService.hashRefreshToken(refreshToken);
    let stored = await authRepository.findRefreshToken(hash);

    if (!stored && payload?.sub) {
      stored = await authRepository.findActiveRefreshTokenByUserId(payload.sub);
    }

    if (!stored) throw new ApiError(401, "Invalid refresh token");

    const user = await authRepository.findUserById(payload.sub);
    if (!user || user.status !== "ACTIVE") {
      throw new ApiError(401, "User no longer active or valid.");
    }

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

  async logout(refreshToken, metadata = {}) {
    try {
      const payload = tokenService.verifyRefreshToken(refreshToken);
      if (payload?.sub) {
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
    } catch {
      // Ignore token verification errors during logout (e.g. token already expired)
    }
  }
}

export default new AuthService();
