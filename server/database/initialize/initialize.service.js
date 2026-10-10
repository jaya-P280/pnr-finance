import bcrypt from "bcryptjs";
import logger from "../../config/logger.js";
import repository from "./initialize.repository.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";
import {
  DEFAULT_SUPER_ADMIN,
  DEFAULT_BRANCH,
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  ROLE_PERMISSIONS_MAP,
} from "./default.data.js";

class InitializeService {
  async initialize() {
    // ===== 1. AUTO-CREATE ALL TABLES IF NOT PRESENT =====
    const schemaConnection = await repository.beginTransaction();
    try {
      logger.info("Starting database schema creation/verification...");
      await repository.createSchema(schemaConnection);
      try {
        await schemaConnection.execute(`ALTER TABLE customer_groups ADD COLUMN field_officer_id INT NULL`);
      } catch {
        // Ignored if column already exists
      }
      await repository.commit(schemaConnection);
      logger.info("Schema created/verified and committed");
    } catch (schemaErr) {
      await repository.rollback(schemaConnection);
      logger.error("Schema creation failed: " + (schemaErr?.stack || schemaErr));
      throw schemaErr;
    }

    const connection = await repository.beginTransaction();
    try {
      logger.info("Starting database initialization check...");

      // ===== 2. Create Roles (Only if missing) =====
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

      // ===== 3. Create Permissions (Only if missing) =====
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

      // ===== 4. Assign Permissions to Roles =====
      logger.info("Assigning permissions to roles...");
      for (const [roleName, permNames] of Object.entries(
        ROLE_PERMISSIONS_MAP,
      )) {
        const roleId = roleMap[roleName];
        if (!roleId) continue;

        const permissionIds = permNames
          .map((permissionName) => permissionMap[permissionName])
          .filter(Boolean);
        await repository.replaceRolePermissions(connection, roleId, permissionIds);
      }

      // ===== 5. Create Default Branch (Only if missing) =====
      logger.info("Checking Head Office branch...");
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

      // ===== 6. Create Default Admin & Staff Users (ONLY IF NOT PRESENT) =====
      logger.info("Checking users table for existing staff/admins...");
      const sampleUsers = [
        {
          employee_code: DEFAULT_SUPER_ADMIN.employee_code,
          first_name: DEFAULT_SUPER_ADMIN.first_name,
          last_name: DEFAULT_SUPER_ADMIN.last_name,
          email: DEFAULT_SUPER_ADMIN.email,
          phone: DEFAULT_SUPER_ADMIN.phone,
          password: DEFAULT_SUPER_ADMIN.password,
          role_name: "SUPER_ADMIN",
        },
        {
          employee_code: "EMP000001",
          first_name: "System",
          last_name: "Admin",
          email: "admin@pnrgfinance.com",
          phone: "9999999991",
          password: "Admin@123",
          role_name: "ADMIN",
        },
        {
          employee_code: "EMP000002",
          first_name: "Branch",
          last_name: "Manager",
          email: "bm@pnrgfinance.com",
          phone: "9999999992",
          password: "Manager@123",
          role_name: "BRANCH_MANAGER",
        },
        {
          employee_code: "EMP000003",
          first_name: "Field",
          last_name: "Officer",
          email: "fo@pnrgfinance.com",
          phone: "9999999993",
          password: "Officer@123",
          role_name: "FIELD_OFFICER",
        },
        {
          employee_code: "EMP000004",
          first_name: "Senior",
          last_name: "Accountant",
          email: "accountant@pnrgfinance.com",
          phone: "9999999994",
          password: "Accountant@123",
          role_name: "ACCOUNTANT",
        },
      ];

      for (const uData of sampleUsers) {
        const [existingU] = await connection.execute(
          `SELECT user_id FROM users WHERE LOWER(email) = LOWER(?) OR employee_code = ? LIMIT 1`,
          [uData.email, uData.employee_code]
        );
        const uRoleId = roleMap[uData.role_name];
        if (existingU.length === 0 && uRoleId) {
          const uHash = await bcrypt.hash(uData.password, 12);
          await repository.createAdmin(connection, {
            branch_id: branchId,
            role_id: uRoleId,
            employee_code: uData.employee_code,
            first_name: uData.first_name,
            last_name: uData.last_name,
            email: uData.email,
            phone: uData.phone,
            password_hash: uHash,
          });
          logger.info(`Sample User created: ${uData.email} (${uData.role_name})`);
        } else {
          logger.info(`User or Employee code already exists in DB, skipping: ${uData.email} (${uData.employee_code})`);
        }
      }

      // ===== 7. Sync/Backfill CUSTOMER users into customers table =====
      const [custRoleRows] = await connection.execute(
        `SELECT role_id FROM roles WHERE role_name = 'CUSTOMER' LIMIT 1`
      );
      if (custRoleRows.length > 0) {
        const customerRoleId = custRoleRows[0].role_id;
        const [unlinkedUsers] = await connection.execute(
          `SELECT u.* FROM users u 
           LEFT JOIN customers c ON LOWER(u.email) = LOWER(c.email)
           WHERE u.role_id = ? AND c.customer_id IS NULL AND u.deleted_at IS NULL`,
          [customerRoleId]
        );
        for (const u of unlinkedUsers) {
          const [lastC] = await connection.execute(
            `SELECT customer_code FROM customers ORDER BY customer_id DESC LIMIT 1`
          );
          const cCode = CodeGenerator.generate("CUST", lastC[0]?.customer_code, 6);
          await connection.execute(
            `INSERT INTO customers (customer_code, branch_id, first_name, last_name, mobile_number, email, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
            [
              cCode,
              u.branch_id || branchId,
              u.first_name,
              u.last_name || null,
              u.mobile_number || "0000000000",
              u.email,
              u.user_id,
            ]
          );
          logger.info(`Backfilled customer record for registered user: ${u.email}`);
        }
      }

      // ===== 8. Seed Default Document Slots/Types =====
      const defaultDocTypes = [
        {
          code: "LOAN_AGREEMENT",
          title: "Signed Loan Agreement Contract",
          category: "LOAN_CONTRACT",
          description: "Download, print, sign, and upload the signed agreement contract after loan approval.",
          is_required_for_loan: 1,
          is_system: 1,
        },
        {
          code: "BANK_BOOK",
          title: "Bank Passbook / Statement",
          category: "BANKING",
          description: "Upload front page of bank passbook or recent 3-month statement showing account number and IFSC.",
          is_required_for_loan: 1,
          is_system: 1,
        },
        {
          code: "IDENTITY_PROOF",
          title: "Identity Proof (Aadhaar / Voter ID / Passport)",
          category: "IDENTITY",
          description: "Government-issued photo identification proof.",
          is_required_for_loan: 0,
          is_system: 1,
        },
        {
          code: "ADDRESS_PROOF",
          title: "Address Proof (Electricity Bill / Ration Card)",
          category: "RESIDENCE",
          description: "Recent residential address proof document.",
          is_required_for_loan: 0,
          is_system: 1,
        },
        {
          code: "INCOME_PROOF",
          title: "Income / Business Proof (ITR / Pay Slip / Trade License)",
          category: "INCOME",
          description: "Proof of monthly income, business license, or salary slips.",
          is_required_for_loan: 0,
          is_system: 1,
        },
      ];

      for (const dt of defaultDocTypes) {
        const [existingDt] = await connection.execute(
          `SELECT id FROM document_types WHERE code = ? LIMIT 1`,
          [dt.code]
        );
        if (existingDt.length === 0) {
          await connection.execute(
            `INSERT INTO document_types (code, title, category, description, is_required_for_loan, is_system, status)
             VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
            [dt.code, dt.title, dt.category, dt.description, dt.is_required_for_loan, dt.is_system]
          );
        }
      }
      logger.info("Default Document Slots verified/seeded.");

      await repository.commit(connection);
      logger.info("Database initialization check completed cleanly.");
    } catch (error) {
      await repository.rollback(connection);
      logger.error(error.stack);
      throw error;
    }
  }
}

export default new InitializeService();
