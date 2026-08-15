import db from "../../database/db.js";

class LoanRepository {
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

  async getLastLoanNumber() {
    const [rows] = await db.execute(`
      SELECT loan_number
      FROM loans
      ORDER BY loan_id DESC
      LIMIT 1
    `);

    return rows[0] || null;
  }

  async existsByApplication(applicationId) {
    const [rows] = await db.execute(
      `
      SELECT loan_id
      FROM loans
      WHERE application_id=?
      LIMIT 1
      `,
      [applicationId],
    );

    return rows.length > 0;
  }

  async findApplication(applicationId) {
    const [rows] = await db.execute(
      `
      SELECT
        la.*,
        lp.recovery_frequency
      FROM loan_applications la
      INNER JOIN loan_products lp
      ON lp.loan_product_id=la.loan_product_id
      WHERE la.application_id=?
      AND la.deleted_at IS NULL
      `,
      [applicationId],
    );

    return rows[0] || null;
  }

  async create(connection, loan) {
    const [result] = await connection.execute(
      `
      INSERT INTO loans
      (
        loan_number,
        application_id,
        customer_id,
        branch_id,
        group_id,
        loan_product_id,
        principal_amount,
        disbursed_amount,
        interest_rate,
        total_interest,
        total_payable,
        outstanding_amount,
        tenure,
        recovery_frequency,
        disbursement_date,
        maturity_date,
        remarks,
        created_by
      )
      VALUES
      (
        ?,?,?,?,?,?,
        ?,?,?,?,?,?,
        ?,?,?,?,?,?,
        ?,?
      )
      `,
      [
        loan.loanNumber,
        loan.applicationId,
        loan.customerId,
        loan.branchId,
        loan.groupId,
        loan.loanProductId,
        loan.principalAmount,
        loan.disbursedAmount,
        loan.interestRate,
        loan.totalInterest,
        loan.totalPayable,
        loan.outstandingAmount,
        loan.tenure,
        loan.recoveryFrequency,
        loan.disbursementDate,
        loan.maturityDate,
        loan.remarks,
        loan.createdBy,
      ],
    );

    return result.insertId;
  }
  async findAll(filters) {
    const params = [];

    let sql = `
      SELECT

        l.loan_id,
        l.loan_number,

        c.customer_code,
        CONCAT(c.first_name,' ',c.last_name) customer_name,

        b.branch_name,

        cg.group_name,

        lp.product_name,

        l.principal_amount,
        l.disbursed_amount,
        l.outstanding_amount,

        l.interest_rate,

        l.tenure,

        l.recovery_frequency,

        l.disbursement_date,

        l.maturity_date,

        l.status,

        l.created_at

      FROM loans l

      INNER JOIN customers c
      ON c.customer_id=l.customer_id

      INNER JOIN branches b
      ON b.branch_id=l.branch_id

      LEFT JOIN customer_groups cg
      ON cg.group_id=l.group_id

      INNER JOIN loan_products lp
      ON lp.loan_product_id=l.loan_product_id

      WHERE 1=1
    `;

    if (filters.search) {
      sql += `
        AND (
          l.loan_number LIKE ?
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
      sql += ` AND l.customer_id=?`;
      params.push(filters.customerId);
    }

    if (filters.branchId) {
      sql += ` AND l.branch_id=?`;
      params.push(filters.branchId);
    }

    if (filters.loanProductId) {
      sql += ` AND l.loan_product_id=?`;
      params.push(filters.loanProductId);
    }

    if (filters.status) {
      sql += ` AND l.status=?`;
      params.push(filters.status);
    }

    if (filters.fromDate) {
      sql += ` AND DATE(l.disbursement_date)>=?`;
      params.push(filters.fromDate);
    }

    if (filters.toDate) {
      sql += ` AND DATE(l.disbursement_date)<=?`;
      params.push(filters.toDate);
    }

    const sortCol = filters.sortBy.includes(".") ? filters.sortBy : `l.${filters.sortBy}`;
    sql += `
      ORDER BY ${sortCol} ${filters.sortOrder}
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

      FROM loans l

      INNER JOIN customers c
      ON c.customer_id=l.customer_id

      INNER JOIN branches b
      ON b.branch_id=l.branch_id

      LEFT JOIN customer_groups cg
      ON cg.group_id=l.group_id

      INNER JOIN loan_products lp
      ON lp.loan_product_id=l.loan_product_id

      WHERE 1=1
    `;

    if (filters.search) {
      sql += `
        AND (
          l.loan_number LIKE ?
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
      sql += ` AND l.customer_id=?`;
      params.push(filters.customerId);
    }

    if (filters.branchId) {
      sql += ` AND l.branch_id=?`;
      params.push(filters.branchId);
    }

    if (filters.loanProductId) {
      sql += ` AND l.loan_product_id=?`;
      params.push(filters.loanProductId);
    }

    if (filters.status) {
      sql += ` AND l.status=?`;
      params.push(filters.status);
    }

    if (filters.fromDate) {
      sql += ` AND DATE(l.disbursement_date)>=?`;
      params.push(filters.fromDate);
    }

    if (filters.toDate) {
      sql += ` AND DATE(l.disbursement_date)<=?`;
      params.push(filters.toDate);
    }

    const [rows] = await db.execute(sql, params);

    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await db.execute(
      `
        SELECT

          l.*,

          la.application_number,

          c.customer_code,
          CONCAT(c.first_name,' ',c.last_name) customer_name,

          b.branch_name,

          cg.group_name,

          lp.product_code,
          lp.product_name

        FROM loans l

        INNER JOIN loan_applications la
        ON la.application_id=l.application_id

        INNER JOIN customers c
        ON c.customer_id=l.customer_id

        INNER JOIN branches b
        ON b.branch_id=l.branch_id

        LEFT JOIN customer_groups cg
        ON cg.group_id=l.group_id

        INNER JOIN loan_products lp
        ON lp.loan_product_id=l.loan_product_id

        WHERE l.loan_id=?
        `,
      [id],
    );

    return rows[0] || null;
  }
  async update(connection, loan) {
    await connection.execute(
      `
      UPDATE loans
      SET
        principal_amount=?,
        disbursed_amount=?,
        interest_rate=?,
        total_interest=?,
        total_payable=?,
        outstanding_amount=?,
        tenure=?,
        recovery_frequency=?,
        disbursement_date=?,
        maturity_date=?,
        remarks=?,
        updated_by=?
      WHERE loan_id=?
      `,
      [
        loan.principalAmount,
        loan.disbursedAmount,
        loan.interestRate,
        loan.totalInterest,
        loan.totalPayable,
        loan.outstandingAmount,
        loan.tenure,
        loan.recoveryFrequency,
        loan.disbursementDate,
        loan.maturityDate,
        loan.remarks,
        loan.updatedBy,
        loan.loanId,
      ],
    );
  }

  async updateStatus(connection, id, status, updatedBy) {
    await connection.execute(
      `
      UPDATE loans
      SET
        status=?,
        updated_by=?
      WHERE loan_id=?
      `,
      [status, updatedBy, id],
    );
  }

  async closeLoan(connection, id, updatedBy) {
    await connection.execute(
      `
      UPDATE loans
      SET
        status='CLOSED',
        outstanding_amount=0,
        updated_by=?
      WHERE loan_id=?
      `,
      [updatedBy, id],
    );
  }

  async forecloseLoan(connection, id, updatedBy) {
    await connection.execute(
      `
      UPDATE loans
      SET
        status='FORECLOSED',
        outstanding_amount=0,
        updated_by=?
      WHERE loan_id=?
      `,
      [updatedBy, id],
    );
  }

  async defaultLoan(connection, id, updatedBy) {
    await connection.execute(
      `
      UPDATE loans
      SET
        status='DEFAULTED',
        updated_by=?
      WHERE loan_id=?
      `,
      [updatedBy, id],
    );
  }

  async getRepaymentScheduleByLoanId(loanId) {
    const [rows] = await db.query(
      `
      SELECT
        rs.schedule_id,
        rs.loan_id,
        rs.installment_number,
        rs.due_date,
        rs.principal_amount,
        rs.interest_amount,
        rs.emi_amount,
        rs.status,
        c.first_name,
        c.last_name,
        c.mobile_number,
        l.loan_number
      FROM repayment_schedules rs
      INNER JOIN loans l ON l.loan_id = rs.loan_id
      INNER JOIN customers c ON c.customer_id = l.customer_id
      WHERE rs.loan_id = ?
      ORDER BY rs.installment_number ASC
      `,
      [loanId]
    );
    return rows;
  }

  async getScheduleItemById(scheduleId) {
    const [rows] = await db.query(
      `
      SELECT
        rs.schedule_id,
        rs.loan_id,
        rs.installment_number,
        rs.due_date,
        rs.principal_amount,
        rs.interest_amount,
        rs.emi_amount,
        rs.status,
        c.first_name,
        c.last_name,
        c.mobile_number,
        l.loan_number
      FROM repayment_schedules rs
      INNER JOIN loans l ON l.loan_id = rs.loan_id
      INNER JOIN customers c ON c.customer_id = l.customer_id
      WHERE rs.schedule_id = ?
      `,
      [scheduleId]
    );
    return rows[0] || null;
  }

  async getUpcomingDueSchedules(daysAhead = 3) {
    const [rows] = await db.query(
      `
      SELECT
        rs.schedule_id,
        rs.loan_id,
        rs.installment_number,
        rs.due_date,
        rs.emi_amount,
        rs.status,
        c.first_name,
        c.last_name,
        c.mobile_number,
        l.loan_number
      FROM repayment_schedules rs
      INNER JOIN loans l ON l.loan_id = rs.loan_id
      INNER JOIN customers c ON c.customer_id = l.customer_id
      WHERE rs.status = 'PENDING'
        AND DATE(rs.due_date) <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
        AND DATE(rs.due_date) >= CURDATE()
      ORDER BY rs.due_date ASC
      `,
      [daysAhead]
    );
    return rows;
  }
}

export default new LoanRepository();
