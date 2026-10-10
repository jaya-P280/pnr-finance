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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- PERMISSION ---
      `CREATE TABLE IF NOT EXISTS permission (
        permission_id INT AUTO_INCREMENT PRIMARY KEY,
        permission_name VARCHAR(100) NOT NULL UNIQUE,
        module_name VARCHAR(50) NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- ROLE PERMISSIONS ---
      `CREATE TABLE IF NOT EXISTS role_permissions (
        role_permission_id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_perm (role_id, permission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

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
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- USERS ---
      `CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        employee_code VARCHAR(20) NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(20),
        role_id INT NOT NULL,
        branch_id INT NULL,
        profile_image VARCHAR(500) NULL,
        status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
        is_first_login TINYINT(1) DEFAULT 1,
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- AUDIT LOGS ---
      `CREATE TABLE IF NOT EXISTS audit_logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        role_name VARCHAR(50),
        branch_id INT NULL,
        customer_id INT NULL,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(50) NOT NULL,
        entity_name VARCHAR(100),
        entity_id VARCHAR(100),
        http_method VARCHAR(10),
        endpoint VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        request_params TEXT,
        request_body TEXT,
        response_status INT,
        response_time_ms INT,
        is_success TINYINT(1) DEFAULT 1,
        error_message TEXT,
        correlation_id VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

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
        profile_image VARCHAR(500) NULL,
        occupation VARCHAR(100),
        monthly_income DECIMAL(15,2),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        status ENUM('ACTIVE','INACTIVE','BLACKLISTED') DEFAULT 'ACTIVE',
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- CUSTOMER KYC ---
      `CREATE TABLE IF NOT EXISTS customer_kyc (
        customer_kyc_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL UNIQUE,
        aadhaar_number VARCHAR(12),
        pan_number VARCHAR(10),
        aadhaar_verified TINYINT(1) DEFAULT 0,
        pan_verified TINYINT(1) DEFAULT 0,
        kyc_status ENUM('PENDING','VERIFIED','REJECTED') DEFAULT 'PENDING',
        verified_by INT NULL,
        verified_at TIMESTAMP NULL,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- CUSTOMER GROUPS ---
      `CREATE TABLE IF NOT EXISTS customer_groups (
        group_id INT AUTO_INCREMENT PRIMARY KEY,
        group_code VARCHAR(20) NOT NULL UNIQUE,
        group_name VARCHAR(200) NOT NULL,
        branch_id INT NOT NULL,
        field_officer_id INT NULL,
        description TEXT,
        meeting_day VARCHAR(20),
        status ENUM('ACTIVE','INACTIVE','DISSOLVED') DEFAULT 'ACTIVE',
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE RESTRICT,
        FOREIGN KEY (field_officer_id) REFERENCES users(user_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- GROUP MEMBERS ---
      `CREATE TABLE IF NOT EXISTS group_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        customer_id INT NOT NULL,
        role ENUM('LEADER','MEMBER') DEFAULT 'MEMBER',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        added_by INT NULL,
        deleted_by INT NULL,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (group_id) REFERENCES customer_groups(group_id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        UNIQUE KEY unique_group_member (group_id, customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- GROUP ATTENDANCE ---
      `CREATE TABLE IF NOT EXISTS group_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        customer_id INT NOT NULL,
        meeting_date DATE NOT NULL,
        status ENUM('PRESENT','ABSENT','LATE') NOT NULL DEFAULT 'PRESENT',
        remarks TEXT,
        recorded_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES customer_groups(group_id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL,
        UNIQUE KEY unique_attendance (group_id, customer_id, meeting_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

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
        processing_fee_type VARCHAR(20) DEFAULT 'PERCENTAGE',
        processing_fee DECIMAL(15,2) DEFAULT 0,
        insurance_fee_type VARCHAR(20) DEFAULT 'PERCENTAGE',
        insurance_fee DECIMAL(15,2) DEFAULT 0,
        penalty DECIMAL(15,2) DEFAULT 0,
        penalty_type VARCHAR(20) DEFAULT 'PERCENTAGE',
        recovery_frequency VARCHAR(50) DEFAULT 'MONTHLY',
        holiday_excluded TINYINT(1) DEFAULT 0,
        include_gst TINYINT(1) DEFAULT 0,
        status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- LOAN APPLICATIONS ---
      `CREATE TABLE IF NOT EXISTS loan_applications (
        application_id INT AUTO_INCREMENT PRIMARY KEY,
        application_number VARCHAR(20) NOT NULL UNIQUE,
        customer_id INT NOT NULL,
        group_id INT NULL,
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
        verified_by INT NULL,
        verified_at TIMESTAMP NULL,
        approved_by INT NULL,
        approved_at TIMESTAMP NULL,
        rejection_reason TEXT,
        applied_by INT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
        FOREIGN KEY (group_id) REFERENCES customer_groups(group_id) ON DELETE SET NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE RESTRICT,
        FOREIGN KEY (loan_product_id) REFERENCES loan_products(loan_product_id) ON DELETE RESTRICT,
        FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
        FOREIGN KEY (applied_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- LOANS ---
      `CREATE TABLE IF NOT EXISTS loans (
        loan_id INT AUTO_INCREMENT PRIMARY KEY,
        loan_number VARCHAR(20) NOT NULL UNIQUE,
        application_id INT NOT NULL UNIQUE,
        customer_id INT NOT NULL,
        branch_id INT NOT NULL,
        group_id INT NULL,
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
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (application_id) REFERENCES loan_applications(application_id) ON DELETE RESTRICT,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE RESTRICT,
        FOREIGN KEY (group_id) REFERENCES customer_groups(group_id) ON DELETE SET NULL,
        FOREIGN KEY (loan_product_id) REFERENCES loan_products(loan_product_id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

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
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- COLLECTIONS ---
      `CREATE TABLE IF NOT EXISTS collections (
        collection_id INT AUTO_INCREMENT PRIMARY KEY,
        receipt_number VARCHAR(20) NOT NULL UNIQUE,
        loan_id INT NOT NULL,
        customer_id INT NOT NULL,
        branch_id INT NOT NULL,
        collected_by INT NULL,
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
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE RESTRICT,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE RESTRICT,
        FOREIGN KEY (collected_by) REFERENCES users(user_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- TASKS ---
      `CREATE TABLE IF NOT EXISTS tasks (
        task_id INT AUTO_INCREMENT PRIMARY KEY,
        task_title VARCHAR(255) NOT NULL,
        description TEXT,
        category ENUM('FIELD_VISIT', 'DOCUMENT_VERIFICATION', 'LOAN_COLLECTION', 'GROUP_MEETING', 'KYC_AUDIT', 'CUSTOMER_ONBOARDING', 'OTHER') DEFAULT 'FIELD_VISIT',
        priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
        status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
        due_date DATE,
        assigned_to INT NULL,
        branch_id INT NULL,
        customer_id INT NULL,
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- EXPENSES ---
      `CREATE TABLE IF NOT EXISTS expenses (
        expense_id INT AUTO_INCREMENT PRIMARY KEY,
        expense_number VARCHAR(30) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        payment_method ENUM('CASH','BANK_TRANSFER','CHEQUE','UPI') DEFAULT 'CASH',
        expense_date DATE NOT NULL,
        paid_to VARCHAR(200),
        branch_id INT NULL,
        receipt_ref VARCHAR(100),
        description TEXT,
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- INCOME ---
      `CREATE TABLE IF NOT EXISTS income (
        income_id INT AUTO_INCREMENT PRIMARY KEY,
        income_number VARCHAR(30) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        payment_method ENUM('CASH','BANK_TRANSFER','CHEQUE','UPI') DEFAULT 'CASH',
        income_date DATE NOT NULL,
        received_from VARCHAR(200),
        branch_id INT NULL,
        receipt_ref VARCHAR(100),
        description TEXT,
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- EMPLOYEE ATTENDANCE ---
      `CREATE TABLE IF NOT EXISTS employee_attendance (
        attendance_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        branch_id INT NULL,
        attendance_date DATE NOT NULL,
        clock_in TIME NULL,
        clock_out TIME NULL,
        status ENUM('PRESENT','ABSENT','LATE','HALF_DAY','ON_LEAVE') DEFAULT 'PRESENT',
        remarks TEXT NULL,
        recorded_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE SET NULL,
        FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL,
        UNIQUE KEY unique_user_date (user_id, attendance_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- LETTERS ---
      `CREATE TABLE IF NOT EXISTS letters (
        letter_id INT AUTO_INCREMENT PRIMARY KEY,
        letter_number VARCHAR(50) NOT NULL UNIQUE,
        letter_type VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL',
        recipient_name VARCHAR(200) NOT NULL,
        recipient_designation VARCHAR(100) NULL,
        organization VARCHAR(200) NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NULL,
        issued_date DATE NULL,
        signatory_name VARCHAR(200) NULL,
        signatory_title VARCHAR(100) NULL,
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- EMPLOYEE SALARIES ---
      `CREATE TABLE IF NOT EXISTS employee_salaries (
        salary_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        basic_salary DECIMAL(15,2) DEFAULT 0,
        hra DECIMAL(15,2) DEFAULT 0,
        allowances DECIMAL(15,2) DEFAULT 0,
        pf_deduction DECIMAL(15,2) DEFAULT 0,
        tax_deduction DECIMAL(15,2) DEFAULT 0,
        net_salary DECIMAL(15,2) DEFAULT 0,
        effective_date DATE NULL,
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- PAYROLL LOGS ---
      `CREATE TABLE IF NOT EXISTS payroll_logs (
        payroll_id INT AUTO_INCREMENT PRIMARY KEY,
        payroll_number VARCHAR(50) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        month_year VARCHAR(20) NOT NULL,
        basic_salary DECIMAL(15,2) DEFAULT 0,
        hra DECIMAL(15,2) DEFAULT 0,
        allowances DECIMAL(15,2) DEFAULT 0,
        deductions DECIMAL(15,2) DEFAULT 0,
        net_payable DECIMAL(15,2) DEFAULT 0,
        payment_method ENUM('BANK_TRANSFER','UPI','CASH','CHEQUE') DEFAULT 'BANK_TRANSFER',
        payment_date DATE NOT NULL,
        payment_status ENUM('PAID','PENDING','FAILED') DEFAULT 'PAID',
        reference_no VARCHAR(100) NULL,
        remarks TEXT NULL,
        processed_by INT NULL,
        created_by INT NULL,
        updated_by INT NULL,
        deleted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- DOCUMENT TYPES (DYNAMIC SLOTS CONFIGURABLE BY ADMIN) ---
      `CREATE TABLE IF NOT EXISTS document_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(50) DEFAULT 'GENERAL',
        description TEXT,
        is_required_for_loan TINYINT(1) DEFAULT 0,
        is_system TINYINT(1) DEFAULT 0,
        status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,

      // --- CUSTOMER DOCUMENTS (UPLOADED FILES & APPROVALS - NORMALIZED 3NF) ---
      `CREATE TABLE IF NOT EXISTS customer_documents (
        document_id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        application_id INT NULL,
        document_type_id INT NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_name VARCHAR(255),
        file_size INT,
        mime_type VARCHAR(100),
        status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
        verified_by INT NULL,
        verified_at TIMESTAMP NULL,
        rejection_reason TEXT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
        FOREIGN KEY (application_id) REFERENCES loan_applications(application_id) ON DELETE SET NULL,
        FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE RESTRICT,
        FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`,
    ];

    let qIdx = 0;
    for (const sql of queries) {
      qIdx++;
      try {
        await connection.execute(sql);
      } catch (err) {
        console.error(`CREATE SCHEMA QUERY #${qIdx} FAILED:`, err?.message || err, "\nSQL:", sql);
        throw err;
      }
    }
    await this.reconcileLegacySchema(connection);
    console.log("✓ All tables created/verified (ACID InnoDB compliant)");
  }
  async reconcileLegacySchema(connection) {
    try {
      // 1. Drop duplicate columns from customers table (canonical data is strictly in customer_kyc)
      const duplicateCustomerCols = ["aadhaar_number", "pan_number", "aadhaar_verified", "pan_verified"];
      for (const col of duplicateCustomerCols) {
        try {
          const [rows] = await connection.query(
            `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME = ?`,
            [col]
          );
          if (rows.length) {
            await connection.query(`ALTER TABLE customers DROP COLUMN ${col}`);
            console.log(`✓ Removed duplicate column ${col} from customers table`);
          }
        } catch { /* ignore drop error */ }
      }

      // 2. Drop duplicate columns from customer_documents table (canonical data is in document_types)
      const duplicateDocCols = ["document_type_code", "document_title"];
      for (const col of duplicateDocCols) {
        try {
          const [rows] = await connection.query(
            `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer_documents' AND COLUMN_NAME = ?`,
            [col]
          );
          if (rows.length) {
            await connection.query(`ALTER TABLE customer_documents DROP COLUMN ${col}`);
            console.log(`✓ Removed duplicate column ${col} from customer_documents table`);
          }
        } catch { /* ignore drop error */ }
      }

      // 3. Drop redundant created_by on loan_applications (applied_by is canonical)
      try {
        const [rows] = await connection.query(
          `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'loan_applications' AND COLUMN_NAME = 'created_by'`
        );
        if (rows.length) {
          await connection.query(`ALTER TABLE loan_applications DROP COLUMN created_by`);
        }
      } catch { /* ignore */ }

      // 4. Drop legacy obsolete tables and columns
      try {
        await connection.query(`DROP TABLE IF EXISTS loan_guarantors`);
        await connection.query(`DROP TABLE IF EXISTS customer_family`);
        await connection.query(`DROP TABLE IF EXISTS customer_nominees`);
      } catch { /* ignore */ }

      const kycColsToDrop = [
        "aadhaar_front", "aadhaar_back", "pan_image", "customer_photo",
        "signature_image", "bank_passbook", "income_proof", "address_proof"
      ];
      for (const col of kycColsToDrop) {
        try {
          const [rows] = await connection.query(
            `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer_kyc' AND COLUMN_NAME = ?`,
            [col]
          );
          if (rows.length) {
            await connection.query(`ALTER TABLE customer_kyc DROP COLUMN ${col}`);
          }
        } catch { /* ignore */ }
      }
    } catch (err) {
      console.warn("Legacy schema reconciliation skipped:", err?.message || err);
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

    if (result?.insertId) return result.insertId;
    const existing = await this.findRoleByName(connection, role.role_name);
    return existing?.role_id || 0;
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
