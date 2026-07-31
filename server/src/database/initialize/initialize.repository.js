import pool from "../db.js";

class InitializeRepository {
  async beginTransaction() {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  async commit(connection) {
    await connection.commit();
    connection.release();
  }

  async rollback(connection) {
    await connection.rollback();
    connection.release();
  }

  async createSchema(connection) {
    const queries = [
      // --- ROLES ---
      `CREATE TABLE IF NOT EXISTS roles (
        role_id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE,
        role_description VARCHAR(255),
        is_system TINYINT(1) DEFAULT 0,
        status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )`,

      // --- PERMISSION ---
      `CREATE TABLE IF NOT EXISTS permission (
        permission_id INT AUTO_INCREMENT PRIMARY KEY,
        permission_name VARCHAR(100) NOT NULL UNIQUE,
        module_name VARCHAR(50) NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // --- ROLE PERMISSIONS ---
      `CREATE TABLE IF NOT EXISTS role_permissions (
        role_permission_id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_perm (role_id, permission_id)
      )`,

      // --- BRANCHES ---
      `CREATE TABLE IF NOT EXISTS branches (
        branch_id INT AUTO_INCREMENT PRIMARY KEY,
        branch_code VARCHAR(20) NOT NULL UNIQUE,
        branch_name VARCHAR(200) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        phone VARCHAR(20),
        email VARCHAR(100),
        status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      )`,

      // --- USERS (status = ACTIVE default, NO PENDING) ---
      `CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        employee_code VARCHAR(20) NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(20),
        role_id INT NOT NULL,
        branch_id INT,
        profile_image VARCHAR(500),
        status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
        is_first_login TINYINT(1) DEFAULT 1,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (role_id) REFERENCES roles(role_id),
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
      )`,

      // --- REFRESH TOKENS ---
      `CREATE TABLE IF NOT EXISTS refresh_tokens (
        token_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_revoked TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )`,

      // --- AUDIT LOGS ---
      `CREATE TABLE IF NOT EXISTS audit_logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(50) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )`,

      // --- COMPANY PROFILE ---
      `CREATE TABLE IF NOT EXISTS company_profile (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255),
        registration_number VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        logo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // --- SYSTEM SETTINGS ---
      `CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        default_interest_rate DECIMAL(5,2) DEFAULT 12.00,
        default_processing_fee DECIMAL(5,2) DEFAULT 2.00,
        max_loan_amount DECIMAL(15,2) DEFAULT 1500000.00,
        min_loan_amount DECIMAL(15,2) DEFAULT 10000.00,
        default_currency VARCHAR(10) DEFAULT 'INR',
        financial_year VARCHAR(50) DEFAULT 'April-March',
        enable_sms TINYINT(1) DEFAULT 0,
        enable_email TINYINT(1) DEFAULT 1,
        enable_whatsapp TINYINT(1) DEFAULT 0,
        self_registration TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // --- CUSTOMERS ---
      `CREATE TABLE IF NOT EXISTS customers (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_code VARCHAR(20) NOT NULL UNIQUE,
        branch_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        gender ENUM('MALE','FEMALE','OTHER'),
        date_of_birth DATE,
        mobile_number VARCHAR(20) NOT NULL,
        alternate_mobile VARCHAR(20),
        email VARCHAR(255),
        aadhaar_number VARCHAR(12),
        pan_number VARCHAR(10),
        aadhaar_verified TINYINT(1) DEFAULT 0,
        pan_verified TINYINT(1) DEFAULT 0,
        occupation VARCHAR(100),
        monthly_income DECIMAL(15,2),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        status ENUM('ACTIVE','INACTIVE','BLACKLISTED') DEFAULT 'ACTIVE',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
        FOREIGN KEY (created_by) REFERENCES users(user_id)
      )`,

      // --- CUSTOMER FAMILY ---
      `CREATE TABLE IF NOT EXISTS customer_family (
        family_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        name VARCHAR(200) NOT NULL,
        relationship ENUM('FATHER','MOTHER','SPOUSE','SON','DAUGHTER','SIBLING','OTHER') NOT NULL,
        date_of_birth DATE,
        occupation VARCHAR(100),
        mobile_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
      )`,

      // --- CUSTOMER NOMINEES ---
      `CREATE TABLE IF NOT EXISTS customer_nominees (
        nominee_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        name VARCHAR(200) NOT NULL,
        relationship VARCHAR(50) NOT NULL,
        date_of_birth DATE,
        mobile_number VARCHAR(20),
        address TEXT,
        percentage DECIMAL(5,2) DEFAULT 100.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
      )`,

      // --- CUSTOMER GROUPS ---
      `CREATE TABLE IF NOT EXISTS customer_groups (
        group_id INT AUTO_INCREMENT PRIMARY KEY,
        group_code VARCHAR(20) NOT NULL UNIQUE,
        group_name VARCHAR(200) NOT NULL,
        branch_id INT NOT NULL,
        description TEXT,
        meeting_day VARCHAR(20),
        status ENUM('ACTIVE','INACTIVE','DISSOLVED') DEFAULT 'ACTIVE',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
        FOREIGN KEY (created_by) REFERENCES users(user_id)
      )`,

      // --- GROUP MEMBERS ---
      `CREATE TABLE IF NOT EXISTS group_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        customer_id INT NOT NULL,
        role ENUM('LEADER','MEMBER') DEFAULT 'MEMBER',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        added_by INT,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (group_id) REFERENCES customer_groups(group_id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        UNIQUE KEY unique_group_member (group_id, customer_id)
      )`,

      // --- GROUP ATTENDANCE ---
      `CREATE TABLE IF NOT EXISTS group_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        customer_id INT NOT NULL,
        meeting_date DATE NOT NULL,
        status ENUM('PRESENT','ABSENT','LATE') NOT NULL DEFAULT 'PRESENT',
        remarks TEXT,
        recorded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES customer_groups(group_id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(user_id),
        UNIQUE KEY unique_attendance (group_id, customer_id, meeting_date)
      )`,

      // --- LOAN PRODUCTS ---
      `CREATE TABLE IF NOT EXISTS loan_products (
        loan_product_id INT AUTO_INCREMENT PRIMARY KEY,
        product_code VARCHAR(20) NOT NULL UNIQUE,
        product_name VARCHAR(200) NOT NULL,
        description TEXT,
        product_type VARCHAR(50) DEFAULT 'TERM_LOAN',
        interest_type VARCHAR(50) DEFAULT 'REDUCING',
        minimum_amount DECIMAL(15,2) NOT NULL,
        maximum_amount DECIMAL(15,2) NOT NULL,
        minimum_tenure INT NOT NULL,
        maximum_tenure INT NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        processing_fee_type ENUM('FLAT','PERCENTAGE') DEFAULT 'PERCENTAGE',
        processing_fee DECIMAL(15,2) DEFAULT 0,
        insurance_fee_type ENUM('FLAT','PERCENTAGE') DEFAULT 'PERCENTAGE',
        insurance_fee DECIMAL(15,2) DEFAULT 0,
        penalty DECIMAL(15,2) DEFAULT 0,
        penalty_type ENUM('FLAT','PERCENTAGE') DEFAULT 'PERCENTAGE',
        recovery_frequency ENUM('DAILY','WEEKLY','BI_WEEKLY','MONTHLY') DEFAULT 'MONTHLY',
        holiday_excluded TINYINT(1) DEFAULT 0,
        include_gst TINYINT(1) DEFAULT 0,
        status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id)
      )`,

      // --- LOAN APPLICATIONS ---
      `CREATE TABLE IF NOT EXISTS loan_applications (
        application_id INT AUTO_INCREMENT PRIMARY KEY,
        application_number VARCHAR(20) NOT NULL UNIQUE,
        customer_id INT NOT NULL,
        group_id INT,
        branch_id INT NOT NULL,
        loan_product_id INT NOT NULL,
        requested_amount DECIMAL(15,2) NOT NULL,
        approved_amount DECIMAL(15,2),
        tenure INT NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
        recovery_frequency ENUM('DAILY','WEEKLY','BI_WEEKLY','MONTHLY') DEFAULT 'MONTHLY',
        purpose TEXT,
        remarks TEXT,
        application_status ENUM('DRAFT','PENDING','UNDER_REVIEW','VERIFIED','APPROVED','REJECTED','DISBURSED') DEFAULT 'PENDING',
        verified_by INT,
        verified_at TIMESTAMP NULL,
        approved_by INT,
        approved_at TIMESTAMP NULL,
        rejection_reason TEXT,
        applied_by INT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (group_id) REFERENCES customer_groups(group_id),
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
        FOREIGN KEY (loan_product_id) REFERENCES loan_products(loan_product_id),
        FOREIGN KEY (verified_by) REFERENCES users(user_id),
        FOREIGN KEY (approved_by) REFERENCES users(user_id),
        FOREIGN KEY (applied_by) REFERENCES users(user_id)
      )`,

      // --- LOAN GUARANTORS ---
      `CREATE TABLE IF NOT EXISTS loan_guarantors (
        guarantor_id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        customer_id INT,
        name VARCHAR(200),
        relationship VARCHAR(50),
        mobile_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES loan_applications(application_id) ON DELETE CASCADE
      )`,

      // --- LOANS ---
      `CREATE TABLE IF NOT EXISTS loans (
        loan_id INT AUTO_INCREMENT PRIMARY KEY,
        loan_number VARCHAR(20) NOT NULL UNIQUE,
        application_id INT NOT NULL UNIQUE,
        customer_id INT NOT NULL,
        branch_id INT NOT NULL,
        group_id INT,
        loan_product_id INT NOT NULL,
        principal_amount DECIMAL(15,2) NOT NULL,
        disbursed_amount DECIMAL(15,2) NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        total_interest DECIMAL(15,2) DEFAULT 0,
        total_payable DECIMAL(15,2) DEFAULT 0,
        outstanding_amount DECIMAL(15,2) DEFAULT 0,
        tenure INT NOT NULL,
        recovery_frequency ENUM('DAILY','WEEKLY','BI_WEEKLY','MONTHLY') DEFAULT 'MONTHLY',
        disbursement_date DATE,
        first_due_date DATE,
        maturity_date DATE,
        status ENUM('ACTIVE','CLOSED','FORECLOSED','DEFAULTED') DEFAULT 'ACTIVE',
        remarks TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (application_id) REFERENCES loan_applications(application_id),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
        FOREIGN KEY (loan_product_id) REFERENCES loan_products(loan_product_id),
        FOREIGN KEY (created_by) REFERENCES users(user_id)
      )`,

      // --- REPAYMENT SCHEDULES ---
      `CREATE TABLE IF NOT EXISTS repayment_schedules (
        schedule_id INT AUTO_INCREMENT PRIMARY KEY,
        loan_id INT NOT NULL,
        installment_no INT NOT NULL,
        due_date DATE NOT NULL,
        emi_amount DECIMAL(15,2) NOT NULL,
        principal_amount DECIMAL(15,2) NOT NULL,
        interest_amount DECIMAL(15,2) NOT NULL,
        balance_amount DECIMAL(15,2) NOT NULL,
        paid_amount DECIMAL(15,2) DEFAULT 0,
        status ENUM('PENDING','PARTIAL','PAID','OVERDUE') DEFAULT 'PENDING',
        paid_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE
      )`,

      // --- LOAN TRANSACTIONS ---
      `CREATE TABLE IF NOT EXISTS loan_transactions (
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        loan_id INT NOT NULL,
        transaction_type ENUM('DISBURSEMENT','PAYMENT','PENALTY','ADJUSTMENT','FORECLOSURE','CLOSURE') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        transaction_date DATE NOT NULL,
        reference_type VARCHAR(50),
        reference_id INT,
        remarks TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(user_id)
      )`,

      // --- COLLECTIONS ---
      `CREATE TABLE IF NOT EXISTS collections (
        collection_id INT AUTO_INCREMENT PRIMARY KEY,
        receipt_number VARCHAR(20) NOT NULL UNIQUE,
        loan_id INT NOT NULL,
        customer_id INT NOT NULL,
        branch_id INT NOT NULL,
        collected_by INT,
        collection_date DATE NOT NULL,
        installment_no INT,
        emi_amount DECIMAL(15,2) DEFAULT 0,
        collection_amount DECIMAL(15,2) NOT NULL,
        penalty_amount DECIMAL(15,2) DEFAULT 0,
        total_amount DECIMAL(15,2) NOT NULL,
        payment_method ENUM('CASH','BANK_TRANSFER','CHEQUE','ONLINE','UPI') DEFAULT 'CASH',
        reference_number VARCHAR(100),
        remarks TEXT,
        status ENUM('PENDING','COMPLETED','PARTIAL') DEFAULT 'COMPLETED',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
        FOREIGN KEY (collected_by) REFERENCES users(user_id),
        FOREIGN KEY (created_by) REFERENCES users(user_id)
      )`,
    ];

    for (const sql of queries) {
      await connection.execute(sql);
    }
    await this.reconcileLegacySchema(connection);
    console.log("✓ All tables created/verified");
  }
  async reconcileLegacySchema(connection) {
    const upgrades = [
      ["loan_products", "product_type VARCHAR(50) DEFAULT 'TERM_LOAN'"], ["loan_products", "interest_type VARCHAR(50) DEFAULT 'REDUCING'"],
      ["loan_products", "minimum_amount DECIMAL(15,2) NULL"], ["loan_products", "maximum_amount DECIMAL(15,2) NULL"],
      ["loan_products", "minimum_tenure INT NULL"], ["loan_products", "maximum_tenure INT NULL"],
      ["loan_products", "processing_fee DECIMAL(15,2) DEFAULT 0"], ["loan_products", "insurance_fee_type VARCHAR(20) DEFAULT 'PERCENTAGE'"],
      ["loan_products", "insurance_fee DECIMAL(15,2) DEFAULT 0"], ["loan_products", "penalty DECIMAL(15,2) DEFAULT 0"],
      ["loan_products", "holiday_excluded TINYINT(1) DEFAULT 0"], ["loan_products", "include_gst TINYINT(1) DEFAULT 0"],
      ["loan_applications", "interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0"], ["loan_applications", "applied_by INT NULL"],
      ["loan_applications", "applied_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP"], ["loan_applications", "remarks TEXT NULL"],
    ];
    for (const [table, definition] of upgrades) {
      const column = definition.split(" ")[0];
      const [rows] = await connection.query(`SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`, [table, column]);
      if (!rows.length) await connection.query(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
    }
    await connection.query(`ALTER TABLE loan_applications MODIFY COLUMN application_status ENUM('DRAFT','PENDING','UNDER_REVIEW','VERIFIED','APPROVED','REJECTED','DISBURSED') DEFAULT 'PENDING'`);
    const [legacyColumns] = await connection.query(`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loan_products' AND COLUMN_NAME IN ('min_amount', 'max_amount', 'min_tenure', 'max_tenure')`);
    if (legacyColumns.length === 4) {
      await connection.query(`UPDATE loan_products SET minimum_amount = COALESCE(minimum_amount, min_amount), maximum_amount = COALESCE(maximum_amount, max_amount), minimum_tenure = COALESCE(minimum_tenure, min_tenure), maximum_tenure = COALESCE(maximum_tenure, max_tenure)`);
    }
  }

  async findRoleByName(connection, roleName) {
    const [rows] = await connection.execute(
      `
            SELECT role_id
            FROM roles
            WHERE role_name = ?
            LIMIT 1
            `,
      [roleName],
    );

    return rows[0];
  }

  async createRole(connection, role) {
    const [result] = await connection.execute(
      `
            INSERT INTO roles
            (
                role_name,
                role_description
            )
            VALUES (?, ?)
            `,
      [role.role_name, role.role_description],
    );

    return result.insertId;
  }

  async findPermissionByName(connection, permissionName) {
    const [rows] = await connection.execute(
      `
            SELECT permission_id
            FROM permission
            WHERE permission_name = ?
            LIMIT 1
            `,
      [permissionName],
    );

    return rows[0];
  }

  async createPermission(connection, permission) {
    const [result] = await connection.execute(
      `
            INSERT INTO permission
            (
                permission_name,
                module_name,
                description
            )
            VALUES (?, ?, ?)
            `,
      [
        permission.permission_name,
        permission.module_name,
        permission.description,
      ],
    );

    return result.insertId;
  }

  async rolePermissionExists(connection, roleId, permissionId) {
    const [rows] = await connection.execute(
      `
            SELECT role_permission_id
            FROM role_permissions
            WHERE role_id = ?
            AND permission_id = ?
            LIMIT 1
            `,
      [roleId, permissionId],
    );

    return rows[0];
  }

  async assignPermission(connection, roleId, permissionId) {
    await connection.execute(
      `
            INSERT INTO role_permissions
            (
                role_id,
                permission_id
            )
            VALUES (?, ?)
            `,
      [roleId, permissionId],
    );
  }

  async replaceRolePermissions(connection, roleId, permissionIds) {
    await connection.execute(
      `DELETE FROM role_permissions WHERE role_id = ?`,
      [roleId],
    );

    for (const permissionId of permissionIds) {
      await this.assignPermission(connection, roleId, permissionId);
    }
  }

  async findBranch(connection, branchCode) {
    const [rows] = await connection.execute(
      `
            SELECT branch_id
            FROM branches
            WHERE branch_code = ?
            LIMIT 1
            `,
      [branchCode],
    );

    return rows[0];
  }

  async createBranch(connection, branch) {
    const [result] = await connection.execute(
      `
            INSERT INTO branches
            (
                branch_code,
                branch_name,
                phone,
                email,
                address,
                city,
                state,
                pincode
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
      [
        branch.branch_code,
        branch.branch_name,
        branch.phone,
        branch.email,
        branch.address,
        branch.city,
        branch.state,
        branch.pincode,
      ],
    );

    return result.insertId;
  }

  async findAdmin(connection, email) {
    const [rows] = await connection.execute(
      `
            SELECT user_id
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
      [email],
    );

    return rows[0];
  }

  async createAdmin(connection, admin) {
    const [result] = await connection.execute(
      `
            INSERT INTO users
            (
                branch_id,
                role_id,
                employee_code,
                first_name,
                last_name,
                email,
                mobile_number,
                password_hash
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
      [
        admin.branch_id,
        admin.role_id,
        admin.employee_code,
        admin.first_name,
        admin.last_name,
        admin.email,
        admin.phone,
        admin.password_hash,
      ],
    );

    return result.insertId;
  }
}

export default new InitializeRepository();
