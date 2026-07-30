import pool from "../../database/db.js";

class AuthRepository {
  async findUserByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT 
          u.user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.password_hash,
          u.branch_id,
          u.role_id,
          r.role_name,
          u.profile_image,
          u.status                          
       FROM users u
       INNER JOIN roles r ON r.role_id = u.role_id
       WHERE u.email = (?)
         AND u.deleted_at IS NULL`,
      [email],
    );
    return rows[0];
  }

    async findUserById(UserId) {
    const [rows] = await pool.execute(
      `SELECT 
          u.user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.role_id,
          u.branch_id,
          r.role_name,
          u.profile_image,
          u.status                          
       FROM users u
       INNER JOIN roles r ON r.role_id = u.role_id
       WHERE u.user_id = ?
         AND u.deleted_at IS NULL`,        
      [UserId],
    );
    return rows[0];
  }

  async saveRefreshToken(userId, tokenHash, expireAt) {
    const [row] = await pool.execute(
      `
            SELECT COUNT(*) as USERS FROM refresh_tokens where user_id = ?`,
      [userId],
    );

    if (row[0]["USERS"] == 1) {
      await this.updateRefreshToken(userId, tokenHash, expireAt);
    } else {
      await pool.execute(
        `
                    INSERT INTO refresh_tokens
                    (
                        user_id,
                        token_hash ,
                        expires_at 
                    ) VALUES (?,?,?)
                `,
        [userId, tokenHash, expireAt],
      );
    }
  }

  async findRefreshToken(hash) {
    const [rows] = await pool.execute(
      `
            SELECT * 
            FROM refresh_tokens
            WHERE token_hash=?
            AND is_revoked = FALSE ;
            `,
      [hash],
    );
    return rows[0];
  }

  async updateRefreshToken(userId, tokenHash, expireAt) {
    await pool.execute(
      `
            UPDATE refresh_tokens
            SET
                token_hash = ?,
                expires_at = ?,
                updated_at = NOW()
            WHERE user_id = ?; 
            `,
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
  return rows[0] || null;
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
    return rows[0] || null;
  }

  async createUser(data) {
  const [result] = await pool.execute(
    `INSERT INTO users (employee_code, first_name, last_name, email, password_hash, mobile_number, role_id, branch_id, status, is_first_login)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 0)`,    // ← CHANGED from 'PENDING', 1
    [
      data.employeeCode, data.firstName, data.lastName,
      data.email, data.passwordHash, data.mobileNumber,
      data.roleId, data.branchId,
    ],
  );
  return result.insertId;
}
}

export default new AuthRepository();
