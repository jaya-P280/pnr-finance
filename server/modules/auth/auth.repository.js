import pool from "../../database/db.js";

class AuthRepository {
  async findUserByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT 
          u.user_id,
          u.employee_code,
          u.first_name,
          u.last_name,
          u.email,
          u.mobile_number,
          u.password_hash,
          u.branch_id,
          u.role_id,
          r.role_name,
          b.branch_name,
          b.branch_code,
          u.profile_image,
          u.status                          
       FROM users u
       INNER JOIN roles r ON r.role_id = u.role_id
       LEFT JOIN branches b ON b.branch_id = u.branch_id
       WHERE LOWER(u.email) = LOWER(?)
         AND u.deleted_at IS NULL`,
      [email ? String(email).trim() : ""],
    );
    return rows[0];
  }

  async findUserByIdentifier(identifier) {
    const rawStr = identifier ? String(identifier).trim() : "";
    const cleanMobile = rawStr.replace(/\D/g, "").slice(-10);
    const isMobile = cleanMobile.length === 10;

    const [rows] = await pool.execute(
      `SELECT 
          u.user_id,
          u.employee_code,
          u.first_name,
          u.last_name,
          u.email,
          u.mobile_number,
          u.password_hash,
          u.branch_id,
          u.role_id,
          r.role_name,
          b.branch_name,
          b.branch_code,
          u.profile_image,
          u.status                          
       FROM users u
       INNER JOIN roles r ON r.role_id = u.role_id
       LEFT JOIN branches b ON b.branch_id = u.branch_id
       WHERE (LOWER(u.email) = LOWER(?) OR u.mobile_number = ? ${isMobile ? "OR u.mobile_number LIKE ?" : ""})
         AND u.deleted_at IS NULL`,
      isMobile ? [rawStr.toLowerCase(), rawStr, `%${cleanMobile}`] : [rawStr.toLowerCase(), rawStr],
    );
    return rows[0];
  }


  async findUserById(UserId) {
    const [rows] = await pool.execute(
      `SELECT 
          u.user_id,
          u.employee_code,
          u.first_name,
          u.last_name,
          u.email,
          u.role_id,
          u.branch_id,
          r.role_name,
          b.branch_name,
          b.branch_code,
          u.profile_image,
          u.status                          
       FROM users u
       INNER JOIN roles r ON r.role_id = u.role_id
       LEFT JOIN branches b ON b.branch_id = u.branch_id
       WHERE u.user_id = ?
         AND u.deleted_at IS NULL`,        
      [UserId],
    );
    return rows[0];
  }

  async updateOwnProfile(userId, data) {
    await pool.execute(
      `UPDATE users
       SET first_name = ?, last_name = ?, mobile_number = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND deleted_at IS NULL`,
      [data.firstName, data.lastName || null, data.mobileNumber || null, userId],
    );
    return this.findUserById(userId);
  }

  async saveRefreshToken(userId, tokenHash, expireAt) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as user_count FROM refresh_tokens WHERE user_id = ?`,
      [userId],
    );

    const count = rows[0]?.user_count || rows[0]?.["COUNT(*)"] || 0;

    if (Number(count) > 0) {
      await this.updateRefreshToken(userId, tokenHash, expireAt);
    } else {
      await pool.execute(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
        [userId, tokenHash, expireAt],
      );
    }
  }

  async findRefreshToken(hash) {
    const [rows] = await pool.execute(
      `SELECT * FROM refresh_tokens WHERE token_hash = ? AND (is_revoked = 0 OR is_revoked = FALSE)`,
      [hash],
    );
    return rows[0];
  }

  async findActiveRefreshTokenByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT * FROM refresh_tokens WHERE user_id = ? AND (is_revoked = 0 OR is_revoked = FALSE) AND expires_at > NOW()`,
      [userId],
    );
    return rows[0];
  }

  async updateRefreshToken(userId, tokenHash, expireAt) {
    await pool.execute(
      `UPDATE refresh_tokens SET token_hash = ?, expires_at = ? WHERE user_id = ?`,
      [tokenHash, expireAt, userId],
    );
  }

  async revokeRefreshToken(userId) {
    await pool.execute(
      `
            DELETE FROM refresh_tokens 
            WHERE user_id = ? ;
            `,
      [userId],
    );
  }

  async getUserPermissions(userId) {
    const [rows] = await pool.execute(
      `
        SELECT
            p.permission_name
        FROM users u
        INNER JOIN role_permissions rp
            ON rp.role_id = u.role_id
        INNER JOIN permission p
            ON p.permission_id = rp.permission_id
        WHERE
            u.user_id = ?
        `,
      [userId],
    );

    return rows.map((row) => row.permission_name);
  }

  async findDefaultCustomerRole() {
    const [rows] = await pool.execute(
      `SELECT role_id FROM roles WHERE role_name = 'CUSTOMER' LIMIT 1`,
    );
    if (rows[0]) return rows[0];

    try {
      const [insertResult] = await pool.execute(
        `INSERT INTO roles (role_name, role_description, is_system, status)
         VALUES ('CUSTOMER', 'Self-service borrower customer portal', 1, 'ACTIVE')`,
      );
      return { role_id: insertResult.insertId };
    } catch {
      const [retryRows] = await pool.execute(
        `SELECT role_id FROM roles WHERE role_name = 'CUSTOMER' LIMIT 1`,
      );
      return retryRows[0] || null;
    }
  }

  async getLastEmployeeCode() {
    const [rows] = await pool.execute(
      `SELECT employee_code FROM users ORDER BY user_id DESC LIMIT 1`,
    );
    return rows[0] || null;
  }

  async getDefaultBranch() {
    const [rows] = await pool.execute(
      `SELECT branch_id FROM branches WHERE status = 'ACTIVE' LIMIT 1`,
    );
    if (rows[0]) return rows[0];

    try {
      const [insertResult] = await pool.execute(
        `INSERT INTO branches (branch_code, branch_name, phone, email, address, city, state, pincode, status)
         VALUES ('HQ000001', 'Head Office', '9999999999', 'admin@pnrgfinance.com', 'Head Office', 'Hyderabad', 'Telangana', '500001', 'ACTIVE')`,
      );
      return { branch_id: insertResult.insertId };
    } catch {
      const [retryRows] = await pool.execute(
        `SELECT branch_id FROM branches WHERE status = 'ACTIVE' LIMIT 1`,
      );
      return retryRows[0] || null;
    }
  }

  async createUser(data) {
    const [result] = await pool.execute(
      `INSERT INTO users (employee_code, first_name, last_name, email, password_hash, mobile_number, role_id, branch_id, status, is_first_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 0)`,
      [
        data.employeeCode, data.firstName, data.lastName,
        data.email, data.passwordHash, data.mobileNumber,
        data.roleId, data.branchId,
      ],
    );
    return result.insertId;
  }

  async findUserByMobile(mobile) {
    if (!mobile) return null;
    const [rows] = await pool.execute(
      `SELECT user_id FROM users WHERE mobile_number = ? AND deleted_at IS NULL LIMIT 1`,
      [mobile],
    );
    return rows[0] || null;
  }

  async findCustomerByMobile(mobile) {
    if (!mobile) return null;
    const [rows] = await pool.execute(
      `SELECT customer_id FROM customers WHERE mobile_number = ? AND deleted_at IS NULL LIMIT 1`,
      [mobile],
    );
    return rows[0] || null;
  }

  async findCustomerByAadhaar(aadhaar) {
    if (!aadhaar) return null;
    const [rows] = await pool.execute(
      `SELECT customer_id FROM customer_kyc WHERE aadhaar_number = ? LIMIT 1`,
      [aadhaar],
    );
    return rows[0] || null;
  }

  async findCustomerByPan(pan) {
    if (!pan) return null;
    const [rows] = await pool.execute(
      `SELECT customer_id FROM customer_kyc WHERE UPPER(pan_number) = UPPER(?) LIMIT 1`,
      [pan],
    );
    return rows[0] || null;
  }

  async getLastCustomerCode() {
    const [rows] = await pool.execute(
      `SELECT customer_code FROM customers ORDER BY customer_id DESC LIMIT 1`,
    );
    return rows[0] || null;
  }

  async createCustomerRecord(data) {
    const [result] = await pool.execute(
      `INSERT INTO customers
       (customer_code, branch_id, first_name, last_name, mobile_number, email, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      [
        data.customerCode,
        data.branchId,
        data.firstName,
        data.lastName || null,
        data.mobileNumber || "0000000000",
        data.email,
        data.createdBy || null,
      ],
    );

    const customerId = result.insertId;

    // Create initial KYC record with PENDING status
    await pool.execute(
      `INSERT INTO customer_kyc (customer_id, aadhaar_number, pan_number, kyc_status)
       VALUES (?, ?, ?, 'PENDING')`,
      [
        customerId,
        data.aadhaarNumber || null,
        data.panNumber ? data.panNumber.toUpperCase() : null,
      ],
    );

    return customerId;
  }
}

export default new AuthRepository();
