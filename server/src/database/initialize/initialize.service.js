import bcrypt from "bcrypt";
import logger from "../../config/logger.js";
import repository from "./initialize.repository.js";
import {
  DEFAULT_ADMIN,
  DEFAULT_DEMO_USERS,
  DEFAULT_SUPER_ADMIN,
  DEFAULT_BRANCH,
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  ROLE_PERMISSIONS_MAP,
} from "./default.data.js";

class InitializeService {
  async initialize() {
    const connection = await repository.beginTransaction();
    try {
      logger.info("Starting database initialization...");

      // ===== 1. AUTO-CREATE ALL TABLES =====
      await repository.createSchema(connection);
      logger.info("Schema created/verified");

      // ===== 2. Create Roles =====
      logger.info("Checking default roles...");
      const roleMap = {}; // role_name => role_id

      for (const role of DEFAULT_ROLES) {
        const existing = await repository.findRoleByName(
          connection,
          role.role_name,
        );
        if (!existing) {
          roleMap[role.role_name] = await repository.createRole(
            connection,
            role,
          );
          logger.info(`Role created: ${role.role_name}`);
        } else {
          roleMap[role.role_name] = existing.role_id;
          logger.info(`Role exists: ${role.role_name}`);
        }
      }

      // --- Create Permissions ---
      logger.info("Checking default permissions...");
      const permissionMap = {}; // permission_name => permission_id

      for (const perm of DEFAULT_PERMISSIONS) {
        const existing = await repository.findPermissionByName(
          connection,
          perm.permission_name,
        );
        if (!existing) {
          permissionMap[perm.permission_name] =
            await repository.createPermission(connection, perm);
          logger.info(`Permission created: ${perm.permission_name}`);
        } else {
          permissionMap[perm.permission_name] = existing.permission_id;
          logger.info(`Permission exists: ${perm.permission_name}`);
        }
      }

      // --- Assign Permissions to Roles ---
      logger.info("Assigning permissions to roles...");

      for (const [roleName, permNames] of Object.entries(
        ROLE_PERMISSIONS_MAP,
      )) {
        const roleId = roleMap[roleName];
        if (!roleId) continue;

        // Replacing permissions keeps existing system roles in sync with the
        // declarative map when access is added or intentionally removed.
        if (roleName) {
          const permissionIds = permNames
            .map((permissionName) => permissionMap[permissionName])
            .filter(Boolean);
          await repository.replaceRolePermissions(connection, roleId, permissionIds);
          logger.info(`  ${roleName} permissions synchronized`);
          continue;
        }

        for (const permName of permNames) {
          const permId = permissionMap[permName];
          if (!permId) continue;

          const assigned = await repository.rolePermissionExists(
            connection,
            roleId,
            permId,
          );
          if (!assigned) {
            await repository.assignPermission(connection, roleId, permId);
            logger.info(`  ${roleName} ← ${permName}`);
          }
        }
      }

      // --- Create Default Branch ---
      logger.info("Checking Head Office...");
      let branch = await repository.findBranch(
        connection,
        DEFAULT_BRANCH.branch_code,
      );
      let branchId;

      if (!branch) {
        branchId = await repository.createBranch(connection, DEFAULT_BRANCH);
        logger.info("Head Office created");
      } else {
        branchId = branch.branch_id;
        logger.info("Head Office exists");
      }

      // --- Create Default Admin ---
      logger.info("Checking default super admin...");
      const existingSuperAdmin = await repository.findAdmin(
        connection,
        DEFAULT_SUPER_ADMIN.email,
      );

      if (!existingSuperAdmin) {
        const superAdminRoleId = roleMap["SUPER_ADMIN"];
        const passwordHash = await bcrypt.hash(DEFAULT_SUPER_ADMIN.password, 12);

        await repository.createAdmin(connection, {
          branch_id: branchId,
          role_id: superAdminRoleId,
          employee_code: DEFAULT_SUPER_ADMIN.employee_code,
          first_name: DEFAULT_SUPER_ADMIN.first_name,
          last_name: DEFAULT_SUPER_ADMIN.last_name,
          email: DEFAULT_SUPER_ADMIN.email,
          phone: DEFAULT_SUPER_ADMIN.phone,
          password_hash: passwordHash,
        });

        logger.info("Default Super Admin created (superadmin@pnrgfinance.com)");
      } else {
        logger.info("Default Super Admin already exists");
      }

      // --- Create Default Admin ---
      logger.info("Checking default admin...");
      const existingAdmin = await repository.findAdmin(
        connection,
        DEFAULT_ADMIN.email,
      );

      if (!existingAdmin) {
        const adminRoleId = roleMap["ADMIN"];

        const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

        await repository.createAdmin(connection, {
          branch_id: branchId,
          role_id: adminRoleId,
          employee_code: DEFAULT_ADMIN.employee_code,
          first_name: DEFAULT_ADMIN.first_name,
          last_name: DEFAULT_ADMIN.last_name,
          email: DEFAULT_ADMIN.email,
          phone: DEFAULT_ADMIN.phone,
          password_hash: passwordHash,
        });

        logger.info(
          "Default Admin created (admin@pnrgfinance.com / Admin@123)",
        );
      } else {
        logger.info("Default Admin already exists");
      }

      // --- Create demo staff users for the remaining system roles ---
      for (const demoUser of DEFAULT_DEMO_USERS) {
        const existing = await repository.findAdmin(connection, demoUser.email);
        if (existing) {
          logger.info(`Demo user already exists: ${demoUser.role_name}`);
          continue;
        }

        const passwordHash = await bcrypt.hash(demoUser.password, 12);
        await repository.createAdmin(connection, {
          branch_id: branchId,
          role_id: roleMap[demoUser.role_name],
          employee_code: demoUser.employee_code,
          first_name: demoUser.first_name,
          last_name: demoUser.last_name,
          email: demoUser.email,
          phone: demoUser.phone,
          password_hash: passwordHash,
        });
        logger.info(`Demo user created: ${demoUser.role_name}`);
      }

      await repository.commit(connection);
      logger.info("Database initialization completed successfully.");
    } catch (error) {
      await repository.rollback(connection);
      logger.error(error.stack);
      throw error;
    }
  }
}

export default new InitializeService();
