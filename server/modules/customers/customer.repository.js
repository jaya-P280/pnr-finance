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
      `SELECT customer_id FROM customers WHERE aadhaar_number = ? AND deleted_at IS NULL LIMIT 1`,
      [aadhaarNumber],
    );
    return rows.length > 0;
  }

  async panExists(connection, panNumber) {
    if (!panNumber) return false;
    const [rows] = await connection.execute(
      `SELECT customer_id FROM customers WHERE pan_number = ? AND deleted_at IS NULL LIMIT 1`,
      [panNumber],
    );
    return rows.length > 0;
  }

  async createCustomer(connection, customer) {
    console.log(customer)
    const [result] = await connection.execute(
      `INSERT INTO customers
       (customer_code, branch_id, first_name, last_name, gender, date_of_birth, mobile_number,
        alternate_mobile, email, aadhaar_number, pan_number, occupation, monthly_income,
        address, city, state, pincode, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
        customer.aadhaarNumber,
        customer.panNumber,
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
             c.email, c.gender, c.city, c.state, c.status, b.branch_name, c.created_at
      FROM customers c
      INNER JOIN branches b ON b.branch_id = c.branch_id
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
    values.push(limit, (page - 1) * limit);

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
      `SELECT c.*, b.branch_name FROM customers c
       INNER JOIN branches b ON b.branch_id = c.branch_id
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
      `SELECT customer_id FROM customers WHERE aadhaar_number = ? AND deleted_at IS NULL LIMIT 1`,
      [aadhaarNumber],
    );
    return rows[0] || null;
  }

  async findByPan(panNumber) {
    if (!panNumber) return null;
    const [rows] = await pool.execute(
      `SELECT customer_id FROM customers WHERE pan_number = ? AND deleted_at IS NULL LIMIT 1`,
      [panNumber],
    );
    return rows[0] || null;
  }

  async updateCustomer(connection, customer) {
    await connection.execute(
      `UPDATE customers SET
        branch_id=?, first_name=?, last_name=?, gender=?, date_of_birth=?, mobile_number=?,
        alternate_mobile=?, email=?, aadhaar_number=?, pan_number=?, occupation=?, monthly_income=?,
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
        customer.aadhaarNumber,
        customer.panNumber,
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
      `INSERT INTO customer_kyc
       (customer_id, aadhaar_number, pan_number, aadhaar_front, aadhaar_back, pan_image,
        customer_photo, signature_image, bank_passbook, income_proof, address_proof)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        kyc.customerId,
        kyc.aadhaarNumber,
        kyc.panNumber,
        kyc.aadhaarFront,
        kyc.aadhaarBack,
        kyc.panImage,
        kyc.customerPhoto,
        kyc.signatureImage,
        kyc.bankPassbook,
        kyc.incomeProof,
        kyc.addressProof,
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
      `UPDATE customer_kyc SET
        aadhaar_number=?, pan_number=?, aadhaar_front=?, aadhaar_back=?, pan_image=?,
        customer_photo=?, signature_image=?, bank_passbook=?, income_proof=?, address_proof=?,
        kyc_status='PENDING', remarks=NULL, verified_by=NULL, verified_at=NULL
       WHERE customer_id=?`,
      [
        kyc.aadhaarNumber,
        kyc.panNumber,
        kyc.aadhaarFront,
        kyc.aadhaarBack,
        kyc.panImage,
        kyc.customerPhoto,
        kyc.signatureImage,
        kyc.bankPassbook,
        kyc.incomeProof,
        kyc.addressProof,
        kyc.customerId,
      ],
    );
  }

  async verifyKyc(connection, customerId, verifiedBy) {
    await connection.execute(
      `UPDATE customer_kyc SET kyc_status='VERIFIED', verified_by=?, verified_at=NOW(), remarks=NULL WHERE customer_id=?`,
      [verifiedBy, customerId],
    );
  }

  async rejectKyc(connection, customerId, remarks, verifiedBy) {
    await connection.execute(
      `UPDATE customer_kyc SET kyc_status='REJECTED', remarks=?, verified_by=?, verified_at=NOW() WHERE customer_id=?`,
      [remarks, verifiedBy, customerId],
    );
  }

  async createFamilyMember(connection, member) {
    await connection.execute(
      `INSERT INTO customer_family (customer_id, member_name, relationship, age, occupation, mobile)
       VALUES (?,?,?,?,?,?)`,
      [
        member.customerId,
        member.memberName,
        member.relationship,
        member.age,
        member.occupation,
        member.mobile,
      ],
    );
  }

  async getFamilyMembers(customerId) {
    const [rows] = await pool.execute(
      `SELECT * FROM customer_family WHERE customer_id=? ORDER BY family_id`,
      [customerId],
    );
    return rows;
  }

  async updateFamilyMember(connection, member) {
    await connection.execute(
      `UPDATE customer_family SET member_name=?, relationship=?, age=?, occupation=?, mobile=? WHERE family_id=?`,
      [
        member.memberName,
        member.relationship,
        member.age,
        member.occupation,
        member.mobile,
        member.familyId,
      ],
    );
  }

  async deleteFamilyMember(connection, familyId) {
    await connection.execute(`DELETE FROM customer_family WHERE family_id=?`, [
      familyId,
    ]);
  }

  async createNominee(connection, nominee) {
    await connection.execute(
      `INSERT INTO customer_nominees (customer_id, nominee_name, relationship, dob, mobile, address, percentage)
       VALUES (?,?,?,?,?,?,?)`,
      [
        nominee.customerId,
        nominee.nomineeName,
        nominee.relationship,
        nominee.dateOfBirth,
        nominee.mobile,
        nominee.address,
        nominee.percentage,
      ],
    );
  }

  async getNominees(customerId) {
    const [rows] = await pool.execute(
      `SELECT * FROM customer_nominees WHERE customer_id=? ORDER BY nominee_id`,
      [customerId],
    );
    return rows;
  }

  async updateNominee(connection, nominee) {
    await connection.execute(
      `UPDATE customer_nominees SET nominee_name=?, relationship=?, dob=?, mobile=?, address=?, percentage=? WHERE nominee_id=?`,
      [
        nominee.nomineeName,
        nominee.relationship,
        nominee.dateOfBirth,
        nominee.mobile,
        nominee.address,
        nominee.percentage,
        nominee.nomineeId,
      ],
    );
  }

  async deleteNominee(connection, nomineeId) {
    await connection.execute(
      `DELETE FROM customer_nominees WHERE nominee_id=?`,
      [nomineeId],
    );
  }

  async getCustomerProfile(customerId) {
    const customer = await this.getCustomerById(customerId);
    const kyc = await this.findKycByCustomerId(customerId);
    const family = await this.getFamilyMembers(customerId);
    const nominees = await this.getNominees(customerId);
    return { customer, kyc, family, nominees };
  }
  async getKycQueue(filters) {
    const { status, branchId, search, page = 1, limit = 20 } = filters;
    let sql = `
    SELECT
      c.customer_id, c.customer_code, c.first_name, c.last_name, c.mobile_number,
      COALESCE(b.branch_name, 'Head Office') as branch_name,
      COALESCE(ck.aadhaar_number, c.aadhaar_number) as aadhaar_number,
      COALESCE(ck.pan_number, c.pan_number) as pan_number,
      ck.aadhaar_front, ck.aadhaar_back, ck.pan_image,
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
