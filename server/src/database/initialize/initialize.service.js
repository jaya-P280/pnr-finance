import bcrypt from "bcrypt";
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
    // ===== 1. AUTO-CREATE ALL TABLES =====
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
      logger.info("Starting database default data seeding...");

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
        const superAdminRoleId = roleMap["SUPER_ADMIN"];
        const passwordHash = await bcrypt.hash(DEFAULT_SUPER_ADMIN.password, 12);
        await connection.execute(
          `UPDATE users SET role_id = ?, password_hash = ? WHERE user_id = ?`,
          [superAdminRoleId, passwordHash, existingSuperAdmin.user_id]
        );
        logger.info("Default Super Admin existing record verified and updated");
      }      // --- Seed Initial Financial Records (Expenses & Income) ---
      const [expCount] = await connection.execute(`SELECT COUNT(*) AS total FROM expenses`);
      if (expCount[0]?.total === 0) {
        const today = new Date().toISOString().split("T")[0];
        const sampleExpenses = [
          ["EXP-2026-000001", "Office Rent", 25000.00, "BANK_TRANSFER", today, "Commercial Plaza Ltd", branchId, "REF-RENT-01", "Monthly Head Office Rent", 2],
          ["EXP-2026-000002", "Salaries", 85000.00, "BANK_TRANSFER", today, "Staff Accounts", branchId, "REF-SAL-01", "Branch Staff Salaries", 2],
          ["EXP-2026-000003", "Fuel & Conveyance", 3200.00, "CASH", today, "Field Officers", branchId, "REF-FUEL-01", "Field Officer Travel Allowance", 2],
          ["EXP-2026-000004", "Utilities", 4500.00, "UPI", today, "State Electricity Board", branchId, "REF-UTIL-01", "Electricity & Water Bill", 2],
          ["EXP-2026-000005", "Tea & Refreshments", 1200.00, "CASH", today, "Local Vendor", branchId, "REF-TEA-01", "Client & Staff Refreshments", 2]
        ];
        for (const exp of sampleExpenses) {
          await connection.execute(
            `INSERT INTO expenses (expense_number, category, amount, payment_method, expense_date, paid_to, branch_id, receipt_ref, description, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            exp
          );
        }
        logger.info("Sample Expenses seeded");
      }

      const [incCount] = await connection.execute(`SELECT COUNT(*) AS total FROM income`);
      if (incCount[0]?.total === 0) {
        const today = new Date().toISOString().split("T")[0];
        const sampleIncome = [
          ["INC-2026-000001", "Loan Processing Fee", 15000.00, "UPI", today, "Batch Applicants #101-110", branchId, "PROC-881", "Loan Processing Fees Collected", 2],
          ["INC-2026-000002", "Documentation Fee", 5000.00, "CASH", today, "New Customer Onboarding", branchId, "DOC-102", "Legal Documentation Charges", 2],
          ["INC-2026-000003", "Late Payment Penalty", 1800.00, "CASH", today, "Overdue Accounts", branchId, "PEN-554", "Overdue Penalty Charges Collected", 2],
          ["INC-2026-000004", "Advisory Fees", 7500.00, "BANK_TRANSFER", today, "Self Help Groups", branchId, "ADV-301", "Micro-enterprise Consulting Fee", 2]
        ];
        for (const inc of sampleIncome) {
          await connection.execute(
            `INSERT INTO income (income_number, category, amount, payment_method, income_date, received_from, branch_id, receipt_ref, description, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            inc
          );
        }
        logger.info("Sample Income seeded");
      }

      // --- Sync/Backfill CUSTOMER users into customers table ---
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

      // --- Seed Sample Customers if empty ---
      const [custCount] = await connection.execute(`SELECT COUNT(*) AS total FROM customers`);
      if (custCount[0]?.total === 0) {
        const sampleCustomers = [
          ["CUST000001", branchId, "Rajesh", "Kumar", "MALE", "1988-05-12", "9876543210", "9876543211", "rajesh.kumar@example.com", "123456789012", "ABCDE1234F", "Farmer", 25000, "Village Road, Plot 12", "Hyderabad", "Telangana", "500001", 1],
          ["CUST000002", branchId, "Priya", "Sharma", "FEMALE", "1992-08-20", "9876543220", "9876543221", "priya.sharma@example.com", "234567890123", "BCDEF2345G", "Small Business", 30000, "Market Yard, Shop 4", "Hyderabad", "Telangana", "500002", 1],
          ["CUST000003", branchId, "Amit", "Patel", "MALE", "1990-11-15", "9876543230", "9876543231", "amit.patel@example.com", "345678901234", "CDEFG3456H", "Trader", 45000, "Station Road, Shop 10", "Hyderabad", "Telangana", "500003", 1],
          ["CUST000004", branchId, "Sunita", "Devi", "FEMALE", "1985-03-25", "9876543240", "9876543241", "sunita.devi@example.com", "456789012345", "DEFGH4567I", "Tailoring", 20000, "Gandhi Nagar", "Hyderabad", "Telangana", "500004", 1],
          ["CUST000005", branchId, "Ramesh", "Verma", "MALE", "1994-07-08", "9876543250", "9876543251", "ramesh.verma@example.com", "567890123456", "EFGHI5678J", "Dairy Farming", 35000, "Subhash Nagar", "Hyderabad", "Telangana", "500005", 1]
        ];
        for (const c of sampleCustomers) {
          await connection.execute(
            `INSERT INTO customers (customer_code, branch_id, first_name, last_name, gender, date_of_birth, mobile_number, alternate_mobile, email, aadhaar_number, pan_number, occupation, monthly_income, address, city, state, pincode, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            c
          );
        }
        logger.info("Sample Customers seeded");
      }

      // --- Seed Sample Customer Groups & Group Members if empty ---
      const [foUsers] = await connection.execute(
        `SELECT u.user_id FROM users u INNER JOIN roles r ON r.role_id = u.role_id WHERE r.role_name = 'FIELD_OFFICER' LIMIT 1`
      );
      const defaultFoId = foUsers[0]?.user_id || null;

      const [groupCount] = await connection.execute(`SELECT COUNT(*) AS total FROM customer_groups`);
      if (groupCount[0]?.total === 0) {
        const [allCusts] = await connection.execute(`SELECT customer_id FROM customers ORDER BY customer_id ASC`);
        const cIds = allCusts.map((c) => c.customer_id);

        if (cIds.length >= 2) {
          const [g1] = await connection.execute(
            `INSERT INTO customer_groups (group_code, group_name, branch_id, field_officer_id, description, meeting_day, status, created_by)
             VALUES ('GRP000001', 'Maha Lakshmi Self Help Group', ?, ?, 'Community self-help group for women entrepreneurs', 'MONDAY', 'ACTIVE', 1)`,
            [branchId, defaultFoId]
          );
          const g1Id = g1.insertId;

          if (cIds[0]) await connection.execute(`INSERT INTO group_members (group_id, customer_id, role, added_by) VALUES (?, ?, 'LEADER', 1)`, [g1Id, cIds[0]]);
          if (cIds[1]) await connection.execute(`INSERT INTO group_members (group_id, customer_id, role, added_by) VALUES (?, ?, 'MEMBER', 1)`, [g1Id, cIds[1]]);
          if (cIds[3]) await connection.execute(`INSERT INTO group_members (group_id, customer_id, role, added_by) VALUES (?, ?, 'MEMBER', 1)`, [g1Id, cIds[3]]);
        }

        if (cIds.length >= 4) {
          const [g2] = await connection.execute(
            `INSERT INTO customer_groups (group_code, group_name, branch_id, field_officer_id, description, meeting_day, status, created_by)
             VALUES ('GRP000002', 'Sai Ram Micro Enterprise Group', ?, ?, 'Local micro business group for traders and farmers', 'WEDNESDAY', 'ACTIVE', 1)`,
            [branchId, defaultFoId]
          );
          const g2Id = g2.insertId;

          if (cIds[2]) await connection.execute(`INSERT INTO group_members (group_id, customer_id, role, added_by) VALUES (?, ?, 'LEADER', 1)`, [g2Id, cIds[2]]);
          if (cIds[4]) await connection.execute(`INSERT INTO group_members (group_id, customer_id, role, added_by) VALUES (?, ?, 'MEMBER', 1)`, [g2Id, cIds[4]]);
        }

        logger.info("Sample Customer Groups & Members seeded");
      } else if (defaultFoId) {
        // Backfill existing groups without field officer assigned
        await connection.execute(
          `UPDATE customer_groups SET field_officer_id = ? WHERE field_officer_id IS NULL`,
          [defaultFoId]
        );
      }

      // --- Seed Commercial Bank & NBFC Loan Schemes ---
      const commercialLoanProducts = [
        ["LP000001", "Commercial Unsecured Personal Loan", "Instant unsecured personal credit for salaried and self-employed professionals for personal expenses and emergencies", 50000, 1000000, 12, 60, 12.50, "PERCENTAGE", 1.50, "MONTHLY", "ACTIVE", 1],
        ["LP000002", "Commercial SME Business Expansion Loan", "Collateral-free commercial business loan for SMEs, retail traders, distributors, and service enterprises", 100000, 2500000, 12, 60, 13.50, "PERCENTAGE", 2.00, "MONTHLY", "ACTIVE", 1],
        ["LP000003", "Commercial Vehicle & Auto Finance Loan", "Vehicle purchase financing for commercial pickup vans, delivery trucks, cars, and fleet vehicles", 100000, 1500000, 12, 60, 11.75, "PERCENTAGE", 1.00, "MONTHLY", "ACTIVE", 1],
        ["LP000004", "Commercial Equipment & Machinery Financing", "Asset purchase financing for industrial machinery, medical equipment, printing presses, and commercial tools", 150000, 3000000, 12, 60, 12.00, "PERCENTAGE", 1.50, "MONTHLY", "ACTIVE", 1],
        ["LP000005", "Commercial Loan Against Property (LAP)", "High-value secured loan against residential or commercial property for long-term business expansion and capital investment", 300000, 5000000, 24, 120, 10.50, "PERCENTAGE", 1.00, "MONTHLY", "ACTIVE", 1],
        ["LP000006", "Commercial Gold Jewellery Credit Loan", "Fast collateralized credit against gold ornaments & jewellery with instant disbursement and flexible repayment", 10000, 1000000, 3, 12, 9.90, "PERCENTAGE", 0.50, "MONTHLY", "ACTIVE", 1],
        ["LP000007", "Merchant Invoice & PoS Working Capital Credit", "Swipe-machine and merchant invoice based daily/weekly working capital financing for retail store owners", 25000, 500000, 3, 18, 14.00, "PERCENTAGE", 1.50, "MONTHLY", "ACTIVE", 1],
        ["LP000008", "Commercial Home Loan & Housing Finance", "Long-term home loan for purchasing residential flats, independent houses, or plot construction", 500000, 7500000, 36, 240, 8.75, "PERCENTAGE", 1.00, "MONTHLY", "ACTIVE", 1],
      ];
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
