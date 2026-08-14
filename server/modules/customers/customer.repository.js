import pool from "../../database/db.js";

class CustomerRepository {
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

  async getLastCustomerCode(connection) {
    const [rows] = await connection.execute(
      `SELECT customer_code FROM customers ORDER BY customer_id DESC LIMIT 1`,
    );
    return rows[0] || null;
  }

  async branchExists(connection, branchId) {
    const [rows] = await connection.execute(
      `SELECT branch_id FROM branches WHERE branch_id = ? AND status = 'ACTIVE' AND deleted_at IS NULL LIMIT 1`,
      [branchId],
    );
    return rows[0] || null;
  }

  async mobileExists(connection, mobileNumber) {
    const [rows] = await connection.execute(
      `SELECT customer_id FROM customers WHERE mobile_number = ? AND deleted_at IS NULL LIMIT 1`,
      [mobileNumber],
    );
    return rows.length > 0;
  }

  async emailExists(connection, email) {
    if (!email) return false;
    const [rows] = await connection.execute(
      `SELECT customer_id FROM customers WHERE email = ? AND deleted_at IS NULL LIMIT 1`,
      [email],
    );
    return rows.length > 0;
  }

  async aadhaarExists(connection, aadhaarNumber) {
    if (!aadhaarNumber) return false;
    const [rows] = await connection.execute(
      `SELECT customer_id FROM customer_kyc WHERE aadhaar_number = ? LIMIT 1`,
      [aadhaarNumber],
    );
    return rows.length > 0;
  }

  async panExists(connection, panNumber) {
    if (!panNumber) return false;
    const [rows] = await connection.execute(
      `SELECT customer_id FROM customer_kyc WHERE pan_number = ? LIMIT 1`,
      [panNumber],
    );
    return rows.length > 0;
  }

  async createCustomer(connection, customer) {
    const [result] = await connection.execute(
      `INSERT INTO customers
       (customer_code, branch_id, first_name, last_name, gender, date_of_birth, mobile_number,
        alternate_mobile, email, profile_image, occupation, monthly_income,
        address, city, state, pincode, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        customer.customerCode,
        customer.branchId,
        customer.firstName,
        customer.lastName,
        customer.gender,
        customer.dateOfBirth,
        customer.mobileNumber,
        customer.alternateMobile,
        customer.email,
        customer.profileImage || null,
        customer.occupation,
        customer.monthlyIncome,
        customer.address,
        customer.city,
        customer.state,
        customer.pincode,
        customer.createdBy,
      ],
    );
    return result.insertId;
  }

  async getCustomers(filters) {
    const { page, limit, search, branchId, status, sortBy, sortOrder } =
      filters;
    const allowedSortColumns = {
      created_at: "c.created_at",
      customer_code: "c.customer_code",
      first_name: "c.first_name",
    };
    const orderColumn = allowedSortColumns[sortBy] || "c.created_at";
    const orderDirection = sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    let sql = `
      SELECT c.customer_id, c.customer_code, c.first_name, c.last_name, c.mobile_number,
             c.email, c.gender, c.city, c.state, c.status, c.profile_image,
             b.branch_name, c.created_at,
             ck.aadhaar_number, ck.pan_number,
             COALESCE(ck.aadhaar_verified, 0) AS aadhaar_verified,
             COALESCE(ck.pan_verified, 0) AS pan_verified,
             COALESCE(ck.kyc_status, 'PENDING') AS kyc_status
      FROM customers c
      INNER JOIN branches b ON b.branch_id = c.branch_id
      LEFT JOIN customer_kyc ck ON ck.customer_id = c.customer_id
      WHERE c.deleted_at IS NULL
    `;
    const values = [];

    if (search) {
      sql += ` AND (c.customer_code LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR c.mobile_number LIKE ?)`;
      const keyword = `%${search}%`;
      values.push(keyword, keyword, keyword, keyword);
    }
    if (branchId) {
      sql += ` AND c.branch_id = ?`;
      values.push(branchId);
    }
    if (status) {
      sql += ` AND c.status = ?`;
      values.push(status);
    }

    sql += ` ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`;
    values.push(Number(limit), (Number(page) - 1) * Number(limit));

    const [rows] = await pool.query(sql, values);
    return rows;
  }

  async countCustomers(filters) {
    const { search, branchId, status } = filters;
    let sql = `SELECT COUNT(*) AS total FROM customers WHERE deleted_at IS NULL`;
    const values = [];

    if (search) {
      sql += ` AND (customer_code LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR mobile_number LIKE ?)`;
      const keyword = `%${search}%`;
      values.push(keyword, keyword, keyword, keyword);
    }
    if (branchId) {
      sql += ` AND branch_id = ?`;
      values.push(branchId);
    }
    if (status) {
      sql += ` AND status = ?`;
      values.push(status);
    }

    const [rows] = await pool.execute(sql, values);
    return rows[0].total;
  }

  async getCustomerById(customerId) {
    const [rows] = await pool.execute(
      `SELECT c.*, b.branch_name,
              ck.aadhaar_number, ck.pan_number,
              COALESCE(ck.aadhaar_verified, 0) AS aadhaar_verified,
              COALESCE(ck.pan_verified, 0) AS pan_verified,
              COALESCE(ck.kyc_status, 'PENDING') AS kyc_status
       FROM customers c
       INNER JOIN branches b ON b.branch_id = c.branch_id
       LEFT JOIN customer_kyc ck ON ck.customer_id = c.customer_id
       WHERE c.customer_id = ? AND c.deleted_at IS NULL LIMIT 1`,
      [customerId],
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    if (!email) return null;
    const [rows] = await pool.execute(
      `SELECT customer_id FROM customers WHERE email = ? AND deleted_at IS NULL LIMIT 1`,
      [email],
    );
    return rows[0] || null;
  }

  async findByMobile(mobileNumber) {
    const [rows] = await pool.execute(
      `SELECT customer_id FROM customers WHERE mobile_number = ? AND deleted_at IS NULL LIMIT 1`,
      [mobileNumber],
    );
    return rows[0] || null;
  }

  async findByAadhaar(aadhaarNumber) {
    if (!aadhaarNumber) return null;
    const [rows] = await pool.execute(
      `SELECT customer_id FROM customer_kyc WHERE aadhaar_number = ? LIMIT 1`,
      [aadhaarNumber],
    );
    return rows[0] || null;
  }

  async findByPan(panNumber) {
    if (!panNumber) return null;
    const [rows] = await pool.execute(
      `SELECT customer_id FROM customer_kyc WHERE pan_number = ? LIMIT 1`,
      [panNumber],
    );
    return rows[0] || null;
  }

  async updateCustomer(connection, customer) {
    await connection.execute(
      `UPDATE customers SET
        branch_id=?, first_name=?, last_name=?, gender=?, date_of_birth=?, mobile_number=?,
        alternate_mobile=?, email=?, profile_image=COALESCE(?, profile_image), occupation=?, monthly_income=?,
        address=?, city=?, state=?, pincode=?, updated_by=?, updated_at=CURRENT_TIMESTAMP
       WHERE customer_id=? AND deleted_at IS NULL`,
      [
        customer.branchId,
        customer.firstName,
        customer.lastName,
        customer.gender,
        customer.dateOfBirth,
        customer.mobileNumber,
        customer.alternateMobile,
        customer.email,
        customer.profileImage || null,
        customer.occupation,
        customer.monthlyIncome,
        customer.address,
        customer.city,
        customer.state,
        customer.pincode,
        customer.updatedBy,
        customer.customerId,
      ],
    );
  }

  async updateProfileImage(connection, customerId, profileImage) {
    await connection.execute(
      `UPDATE customers SET profile_image=?, updated_at=CURRENT_TIMESTAMP WHERE customer_id=? AND deleted_at IS NULL`,
      [profileImage, customerId],
    );
  }

  async updateCustomerStatus(connection, customerId, status, updatedBy) {
    await connection.execute(
      `UPDATE customers SET status=?, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE customer_id=? AND deleted_at IS NULL`,
      [status, updatedBy, customerId],
    );
  }

  async softDeleteCustomer(connection, customerId, deletedBy) {
    await connection.execute(
      `UPDATE customers SET status='INACTIVE', deleted_at=CURRENT_TIMESTAMP, deleted_by=?, updated_by=?, updated_at=CURRENT_TIMESTAMP
       WHERE customer_id=? AND deleted_at IS NULL`,
      [deletedBy, deletedBy, customerId],
    );
  }

  async createKyc(connection, kyc) {
    await connection.execute(
      `INSERT INTO customer_kyc (customer_id, aadhaar_number, pan_number, aadhaar_verified, pan_verified)
       VALUES (?,?,?,?,?)`,
      [
        kyc.customerId,
        kyc.aadhaarNumber || null,
        kyc.panNumber || null,
        kyc.aadhaarVerified ? 1 : 0,
        kyc.panVerified ? 1 : 0,
      ],
    );
  }

  async findKycByCustomerId(customerId) {
    const [rows] = await pool.execute(
      `SELECT * FROM customer_kyc WHERE customer_id=?`,
      [customerId],
    );
    return rows[0] || null;
  }

  async updateKyc(connection, kyc) {
    await connection.execute(
      `INSERT INTO customer_kyc (customer_id, aadhaar_number, pan_number, aadhaar_verified, pan_verified)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
        aadhaar_number = COALESCE(VALUES(aadhaar_number), aadhaar_number),
        pan_number = COALESCE(VALUES(pan_number), pan_number),
        aadhaar_verified = COALESCE(VALUES(aadhaar_verified), aadhaar_verified),
        pan_verified = COALESCE(VALUES(pan_verified), pan_verified),
        updated_at = CURRENT_TIMESTAMP`,
      [
        kyc.customerId,
        kyc.aadhaarNumber || null,
        kyc.panNumber || null,
        kyc.aadhaarVerified !== undefined ? (kyc.aadhaarVerified ? 1 : 0) : null,
        kyc.panVerified !== undefined ? (kyc.panVerified ? 1 : 0) : null,
      ],
    );
  }

  async verifyKyc(connection, customerId, verifiedBy) {
    await connection.execute(
      `UPDATE customer_kyc SET kyc_status='VERIFIED', aadhaar_verified=1, pan_verified=1, verified_by=?, verified_at=NOW(), remarks=NULL WHERE customer_id=?`,
      [verifiedBy, customerId],
    );
  }

  async rejectKyc(connection, customerId, remarks, verifiedBy) {
    await connection.execute(
      `UPDATE customer_kyc SET kyc_status='REJECTED', remarks=?, verified_by=?, verified_at=NOW() WHERE customer_id=?`,
      [remarks, verifiedBy, customerId],
    );
  }

  async getCustomerProfile(customerId) {
    const customer = await this.getCustomerById(customerId);
    const kyc = await this.findKycByCustomerId(customerId);
    return { customer, kyc };
  }

  async getKycQueue(filters) {
    const { status, branchId, search, page = 1, limit = 20 } = filters;
    let sql = `
    SELECT
      c.customer_id, c.customer_code, c.first_name, c.last_name, c.mobile_number, c.profile_image,
      COALESCE(b.branch_name, 'Head Office') as branch_name,
      ck.aadhaar_number, ck.pan_number,
      COALESCE(ck.aadhaar_verified, 0) AS aadhaar_verified,
      COALESCE(ck.pan_verified, 0) AS pan_verified,
      COALESCE(ck.kyc_status, 'PENDING') as kyc_status,
      ck.verified_by, ck.verified_at, ck.remarks, c.created_at AS kyc_submitted_at
    FROM customers c
    LEFT JOIN customer_kyc ck ON c.customer_id = ck.customer_id
    LEFT JOIN branches b ON b.branch_id = c.branch_id
    WHERE c.deleted_at IS NULL
  `;
    const values = [];
    if (status) {
      sql += ` AND (ck.kyc_status = ? OR (ck.kyc_status IS NULL AND ? = 'PENDING'))`;
      values.push(status, status);
    }
    if (branchId) {
      sql += ` AND c.branch_id = ?`;
      values.push(branchId);
    }
    if (search) {
      sql += ` AND (c.customer_code LIKE ? OR CONCAT(c.first_name,' ',COALESCE(c.last_name,'')) LIKE ? OR c.mobile_number LIKE ?)`;
      const kw = `%${search}%`;
      values.push(kw, kw, kw);
    }
    sql += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    values.push(Number(limit), (Number(page) - 1) * Number(limit));
    const [rows] = await pool.query(sql, values);
    return rows;
  }

  async countKycQueue(filters) {
    const { status, branchId, search } = filters;
    let sql = `
    SELECT COUNT(*) total
    FROM customers c
    LEFT JOIN customer_kyc ck ON c.customer_id = ck.customer_id
    WHERE c.deleted_at IS NULL
  `;
    const values = [];
    if (status) {
      sql += ` AND (ck.kyc_status = ? OR (ck.kyc_status IS NULL AND ? = 'PENDING'))`;
      values.push(status, status);
    }
    if (branchId) {
      sql += ` AND c.branch_id = ?`;
      values.push(branchId);
    }
    if (search) {
      sql += ` AND (c.customer_code LIKE ? OR CONCAT(c.first_name,' ',COALESCE(c.last_name,'')) LIKE ? OR c.mobile_number LIKE ?)`;
      const kw = `%${search}%`;
      values.push(kw, kw, kw);
    }
    const [rows] = await pool.execute(sql, values);
    return rows[0].total;
  }

  async getKycStatusCounts() {
    const [rows] = await pool.query(
      `SELECT kyc_status, COUNT(*) total FROM customer_kyc GROUP BY kyc_status`,
    );
    const counts = { PENDING: 0, VERIFIED: 0, REJECTED: 0 };
    rows.forEach((r) => {
      counts[r.kyc_status] = r.total;
    });
    return counts;
  }
}

export default new CustomerRepository();
