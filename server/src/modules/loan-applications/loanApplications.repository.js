import db from "../../database/db.js";

class LoanApplicationRepository {
  async beginTransaction() {
    return await db.getConnection();
  }

  async commit(connection) {
    await connection.commit();
    connection.release();
  }

  async rollback(connection) {
    await connection.rollback();
    connection.release();
  }

  async getLastApplicationNumber() {
    const [rows] = await db.execute(`
      SELECT application_number
      FROM loan_applications
      ORDER BY application_id DESC
      LIMIT 1
    `);

    return rows[0] || null;
  }

  async findCustomer(customerId) {
    const [rows] = await db.execute(
      `
      SELECT
        customer_id,
        status
      FROM customers
      WHERE customer_id = ?
      AND deleted_at IS NULL
      `,
      [customerId],
    );

    return rows[0] || null;
  }

  async findGroup(groupId) {
    if (!groupId) {
      return null;
    }

    const [rows] = await db.execute(
      `
      SELECT
        group_id,
        status
      FROM customer_groups
      WHERE group_id = ?
      `,
      [groupId],
    );

    return rows[0] || null;
  }

  async findLoanProduct(loanProductId) {
    const [rows] = await db.execute(
      `
      SELECT
        loan_product_id,
        minimum_amount,
        maximum_amount,
        minimum_tenure,
        maximum_tenure,
        interest_rate,
        status
      FROM loan_products
      WHERE loan_product_id = ?
      AND deleted_at IS NULL
      `,
      [loanProductId],
    );

    return rows[0] || null;
  }

  async create(connection, application) {
    const [result] = await connection.execute(
      `
      INSERT INTO loan_applications
      (
        application_number,
        customer_id,
        group_id,
        loan_product_id,
        requested_amount,
        approved_amount,
        tenure,
        interest_rate,
        purpose,
        remarks,
        application_status,
        applied_by
      )
      VALUES
      (
        ?,?,?,?,?,?,
        ?,?,?,?,?,?
      )
      `,
      [
        application.applicationNumber,
        application.customerId,
        application.groupId,
        application.loanProductId,
        application.requestedAmount,
        application.approvedAmount,
        application.tenure,
        application.interestRate,
        application.purpose,
        application.remarks,
        application.applicationStatus,
        application.appliedBy,
      ],
    );

    return result.insertId;
  }
  async findAll(filters) {
    const params = [];

    let sql = `
      SELECT
        la.application_id,
        la.application_number,

        c.customer_id,
        c.customer_code,
        CONCAT(c.first_name,' ',c.last_name) customer_name,

        cg.group_id,
        cg.group_name,

        lp.loan_product_id,
        lp.product_name,

        la.requested_amount,
        la.approved_amount,
        la.tenure,
        la.interest_rate,

        la.application_status,

        la.applied_at,
        la.created_at

      FROM loan_applications la

      INNER JOIN customers c
      ON c.customer_id = la.customer_id

      LEFT JOIN customer_groups cg
      ON cg.group_id = la.group_id

      INNER JOIN loan_products lp
      ON lp.loan_product_id = la.loan_product_id

      WHERE la.deleted_at IS NULL
    `;

    if (filters.search) {
      sql += `
        AND (
          la.application_number LIKE ?
          OR c.customer_code LIKE ?
          OR CONCAT(c.first_name,' ',c.last_name) LIKE ?
        )
      `;

      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`,
        `%${filters.search}%`,
      );
    }

    if (filters.customerId) {
      sql += ` AND la.customer_id = ?`;
      params.push(filters.customerId);
    }

    if (filters.groupId) {
      sql += ` AND la.group_id = ?`;
      params.push(filters.groupId);
    }

    if (filters.loanProductId) {
      sql += ` AND la.loan_product_id = ?`;
      params.push(filters.loanProductId);
    }

    if (filters.status) {
      sql += ` AND la.application_status = ?`;
      params.push(filters.status);
    }

    if (filters.fromDate) {
      sql += ` AND DATE(la.created_at) >= ?`;
      params.push(filters.fromDate);
    }

    if (filters.toDate) {
      sql += ` AND DATE(la.created_at) <= ?`;
      params.push(filters.toDate);
    }

    sql += `
      ORDER BY ${filters.sortBy} ${filters.sortOrder}
      LIMIT ?
      OFFSET ?
    `;

    params.push(filters.limit);
    params.push((filters.page - 1) * filters.limit);

    const [rows] = await db.query(sql, params);

    return rows;
  }

  async count(filters) {
    const params = [];

    let sql = `
      SELECT COUNT(*) total

      FROM loan_applications la

      INNER JOIN customers c
      ON c.customer_id = la.customer_id

      LEFT JOIN customer_groups cg
      ON cg.group_id = la.group_id

      INNER JOIN loan_products lp
      ON lp.loan_product_id = la.loan_product_id

      WHERE la.deleted_at IS NULL
    `;

    if (filters.search) {
      sql += `
        AND (
          la.application_number LIKE ?
          OR c.customer_code LIKE ?
          OR CONCAT(c.first_name,' ',c.last_name) LIKE ?
        )
      `;

      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`,
        `%${filters.search}%`,
      );
    }

    if (filters.customerId) {
      sql += ` AND la.customer_id = ?`;
      params.push(filters.customerId);
    }

    if (filters.groupId) {
      sql += ` AND la.group_id = ?`;
      params.push(filters.groupId);
    }

    if (filters.loanProductId) {
      sql += ` AND la.loan_product_id = ?`;
      params.push(filters.loanProductId);
    }

    if (filters.status) {
      sql += ` AND la.application_status = ?`;
      params.push(filters.status);
    }

    if (filters.fromDate) {
      sql += ` AND DATE(la.created_at) >= ?`;
      params.push(filters.fromDate);
    }

    if (filters.toDate) {
      sql += ` AND DATE(la.created_at) <= ?`;
      params.push(filters.toDate);
    }

    const [rows] = await db.execute(sql, params);

    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT

        la.*,

        c.customer_code,
        CONCAT(c.first_name,' ',c.last_name) customer_name,

        cg.group_name,

        lp.product_code,
        lp.product_name,
        lp.product_type

      FROM loan_applications la

      INNER JOIN customers c
      ON c.customer_id = la.customer_id

      LEFT JOIN customer_groups cg
      ON cg.group_id = la.group_id

      INNER JOIN loan_products lp
      ON lp.loan_product_id = la.loan_product_id

      WHERE la.application_id = ?
      AND la.deleted_at IS NULL
      `,
      [id],
    );

    return rows[0] || null;
  }
  async update(connection, application) {
    await connection.execute(
      `
      UPDATE loan_applications
      SET
        customer_id=?,
        group_id=?,
        loan_product_id=?,
        requested_amount=?,
        tenure=?,
        interest_rate=?,
        purpose=?,
        remarks=?,
        updated_at=NOW()
      WHERE application_id=?
      `,
      [
        application.customerId,
        application.groupId,
        application.loanProductId,
        application.requestedAmount,
        application.tenure,
        application.interestRate,
        application.purpose,
        application.remarks,
        application.applicationId,
      ],
    );
  }

  async updateStatus(connection, applicationId, status) {
    await connection.execute(
      `
      UPDATE loan_applications
      SET
        application_status=?,
        updated_at=NOW()
      WHERE application_id=?
      `,
      [status, applicationId],
    );
  }

  async updateVerification(connection, applicationId, verifiedBy) {
    await connection.execute(
      `
      UPDATE loan_applications
      SET
        application_status='VERIFIED',
        verified_by=?,
        verified_at=NOW(),
        updated_at=NOW()
      WHERE application_id=?
      `,
      [verifiedBy, applicationId],
    );
  }

  async updateApproval(connection, applicationId, approvedAmount, approvedBy) {
    await connection.execute(
      `
      UPDATE loan_applications
      SET
        application_status='APPROVED',
        approved_amount=?,
        approved_by=?,
        approved_at=NOW(),
        updated_at=NOW()
      WHERE application_id=?
      `,
      [approvedAmount, approvedBy, applicationId],
    );
  }

  async reject(connection, applicationId, rejectionReason, approvedBy) {
    await connection.execute(
      `
      UPDATE loan_applications
      SET
        application_status='REJECTED',
        rejection_reason=?,
        approved_by=?,
        approved_at=NOW(),
        updated_at=NOW()
      WHERE application_id=?
      `,
      [rejectionReason, approvedBy, applicationId],
    );
  }

  async updateDisbursement(connection, applicationId) {
    await connection.execute(
      `
      UPDATE loan_applications
      SET
        application_status='DISBURSED',
        updated_at=NOW()
      WHERE application_id=?
      `,
      [applicationId],
    );
  }

  async softDelete(connection, applicationId) {
    await connection.execute(
      `
      UPDATE loan_applications
      SET
        deleted_at=NOW(),
        updated_at=NOW()
      WHERE application_id=?
      `,
      [applicationId],
    );
  }
}

export default new LoanApplicationRepository();
