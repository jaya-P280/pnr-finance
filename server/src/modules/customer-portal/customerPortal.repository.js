import pool from "../../database/db.js";

class CustomerPortalRepository {
  async getProfileByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT
         u.user_id AS userId,
         u.email,
         u.first_name AS firstName,
         u.last_name AS lastName,
         u.mobile_number AS mobileNumber,
         u.role_id AS roleId,
         r.role_name AS role,
         u.status,
         u.profile_image AS profileImage,
         c.customer_id AS customerId,
         c.address,
         c.city,
         c.state,
         c.pincode,
         c.date_of_birth AS dateOfBirth
       FROM users u
       INNER JOIN roles r ON r.role_id = u.role_id
       LEFT JOIN customers c
         ON c.email = u.email
        AND c.deleted_at IS NULL
       WHERE u.user_id = ?
         AND u.deleted_at IS NULL
       LIMIT 1`,
      [userId],
    );

    return rows[0] || null;
  }

  async getCustomerByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT c.*
       FROM users u
       INNER JOIN customers c
         ON c.email = u.email
        AND c.deleted_at IS NULL
       WHERE u.user_id = ?
         AND u.deleted_at IS NULL
       LIMIT 1`,
      [userId],
    );

    return rows[0] || null;
  }

  async createCustomerForUser(userId) {
    await pool.execute(
      `INSERT INTO customers
        (customer_code, branch_id, first_name, last_name, mobile_number, email, created_by)
       SELECT CONCAT('CUST-', u.user_id), u.branch_id, u.first_name, u.last_name,
              COALESCE(NULLIF(u.mobile_number, ''), '0000000000'), u.email, u.user_id
       FROM users u
       WHERE u.user_id = ? AND u.deleted_at IS NULL
       ON DUPLICATE KEY UPDATE customer_id = customer_id`,
      [userId],
    );
    return this.getCustomerByUserId(userId);
  }

  async updateProfile(userId, customerId, data) {
    const userFields = [];
    const userValues = [];

    if (data.firstName !== undefined) {
      userFields.push("first_name = ?");
      userValues.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      userFields.push("last_name = ?");
      userValues.push(data.lastName);
    }
    if (data.mobileNumber !== undefined) {
      userFields.push("mobile_number = ?");
      userValues.push(data.mobileNumber);
    }

    if (userFields.length) {
      userValues.push(userId);
      await pool.execute(
        `UPDATE users
         SET ${userFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        userValues,
      );
    }

    if (customerId) {
      const customerFields = [];
      const customerValues = [];
      const customerFieldMap = {
        firstName: "first_name",
        lastName: "last_name",
        mobileNumber: "mobile_number",
        address: "address",
        city: "city",
        state: "state",
        pincode: "pincode",
      };

      Object.entries(customerFieldMap).forEach(([key, column]) => {
        if (data[key] !== undefined) {
          customerFields.push(`${column} = ?`);
          customerValues.push(data[key]);
        }
      });

      if (customerFields.length) {
        customerValues.push(customerId);
        await pool.execute(
          `UPDATE customers
           SET ${customerFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
           WHERE customer_id = ?`,
          customerValues,
        );
      }
    }

    return this.getProfileByUserId(userId);
  }

  async getApplicationsByCustomerId(customerId, filters) {
    const page = Math.max(Number.parseInt(filters.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(filters.limit, 10) || 10, 1),
      100,
    );
    const offset = (page - 1) * limit;
    const params = [customerId];
    let sql = `
      SELECT
        la.application_id AS id,
        la.application_number AS applicationNumber,
        la.loan_product_id AS loanProductId,
        lp.product_name AS productName,
        la.requested_amount AS requestedAmount,
        la.approved_amount AS approvedAmount,
        la.tenure AS tenureMonths,
        la.interest_rate AS interestRate,
        la.purpose,
        la.application_status AS status,
        la.rejection_reason AS rejectionReason,
        la.applied_at AS submittedAt,
        la.approved_at AS approvedAt,
        la.created_at AS createdAt,
        l.loan_id AS loanId
      FROM loan_applications la
      INNER JOIN loan_products lp
        ON lp.loan_product_id = la.loan_product_id
      LEFT JOIN loans l
        ON l.application_id = la.application_id
      WHERE la.customer_id = ?
        AND la.deleted_at IS NULL
    `;

    if (filters.status) {
      sql += " AND la.application_status = ?";
      params.push(filters.status);
    }

    // Keep pagination values as validated integers. Some MySQL-compatible
    // servers reject LIMIT/OFFSET placeholders in prepared statements.
    sql += ` ORDER BY la.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [applications] = await pool.query(sql, params);

    const countParams = [customerId];
    let countSql = `
      SELECT COUNT(*) AS total
      FROM loan_applications
      WHERE customer_id = ?
        AND deleted_at IS NULL
    `;

    if (filters.status) {
      countSql += " AND application_status = ?";
      countParams.push(filters.status);
    }

    const [countRows] = await pool.execute(countSql, countParams);

    return {
      applications,
      pagination: {
        page,
        limit,
        totalRecords: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / limit),
      },
    };
  }

  async getApplicationById(applicationId) {
    const [rows] = await pool.execute(
      `SELECT
         la.application_id AS id,
         la.customer_id AS customerId,
         la.application_number AS applicationNumber,
         la.loan_product_id AS loanProductId,
         lp.product_name AS productName,
         la.requested_amount AS requestedAmount,
         la.approved_amount AS approvedAmount,
         la.tenure AS tenureMonths,
         la.interest_rate AS interestRate,
         la.purpose,
         la.application_status AS status,
         la.rejection_reason AS rejectionReason,
         la.applied_at AS submittedAt,
         la.approved_at AS approvedAt,
         la.created_at AS createdAt,
         l.loan_id AS loanId
       FROM loan_applications la
       INNER JOIN loan_products lp
         ON lp.loan_product_id = la.loan_product_id
       LEFT JOIN loans l
         ON l.application_id = la.application_id
       WHERE la.application_id = ?
         AND la.deleted_at IS NULL
       LIMIT 1`,
      [applicationId],
    );

    return rows[0] || null;
  }

  async getLoansByCustomerId(customerId, filters) {
    const page = Math.max(Number.parseInt(filters.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(filters.limit, 10) || 10, 1),
      100,
    );
    const offset = (page - 1) * limit;
    const params = [customerId];
    let sql = `
      SELECT
        l.loan_id AS id,
        l.loan_number AS loanNumber,
        lp.product_name AS productName,
        l.principal_amount AS sanctionedAmount,
        l.disbursed_amount AS disbursedAmount,
        l.outstanding_amount AS outstandingAmount,
        l.interest_rate AS interestRate,
        l.tenure AS tenureMonths,
        l.recovery_frequency AS recoveryFrequency,
        l.disbursement_date AS disbursementDate,
        l.maturity_date AS maturityDate,
        l.status,
        (
          SELECT rs.emi_amount
          FROM repayment_schedules rs
          WHERE rs.loan_id = l.loan_id
          ORDER BY rs.installment_no
          LIMIT 1
        ) AS emiAmount,
        (
          SELECT rs.due_date
          FROM repayment_schedules rs
          WHERE rs.loan_id = l.loan_id
            AND rs.status IN ('PENDING', 'PARTIAL', 'OVERDUE')
          ORDER BY rs.due_date
          LIMIT 1
        ) AS nextDueDate
      FROM loans l
      INNER JOIN loan_products lp
        ON lp.loan_product_id = l.loan_product_id
      WHERE l.customer_id = ?
        AND l.deleted_at IS NULL
    `;

    if (filters.status) {
      sql += " AND l.status = ?";
      params.push(filters.status);
    }

    sql += ` ORDER BY l.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [loans] = await pool.query(sql, params);

    const countParams = [customerId];
    let countSql = `
      SELECT COUNT(*) AS total
      FROM loans
      WHERE customer_id = ?
        AND deleted_at IS NULL
    `;

    if (filters.status) {
      countSql += " AND status = ?";
      countParams.push(filters.status);
    }

    const [countRows] = await pool.execute(countSql, countParams);

    return {
      loans,
      pagination: {
        page,
        limit,
        totalRecords: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / limit),
      },
    };
  }

  async getLoanById(loanId) {
    const [rows] = await pool.execute(
      `SELECT
         l.loan_id AS id,
         l.customer_id AS customerId,
         l.loan_number AS loanNumber,
         lp.product_name AS productName,
         l.principal_amount AS sanctionedAmount,
         l.disbursed_amount AS disbursedAmount,
         l.outstanding_amount AS outstandingAmount,
         l.interest_rate AS interestRate,
         l.total_interest AS totalInterest,
         l.total_payable AS totalPayable,
         l.tenure AS tenureMonths,
         l.recovery_frequency AS recoveryFrequency,
         l.disbursement_date AS disbursementDate,
         l.maturity_date AS maturityDate,
         l.status
       FROM loans l
       INNER JOIN loan_products lp
         ON lp.loan_product_id = l.loan_product_id
       WHERE l.loan_id = ?
         AND l.deleted_at IS NULL
       LIMIT 1`,
      [loanId],
    );

    return rows[0] || null;
  }

  async getRepaymentSchedule(loanId) {
    const [rows] = await pool.execute(
      `SELECT
         schedule_id AS id,
         installment_no AS installmentNumber,
         due_date AS dueDate,
         emi_amount AS totalAmount,
         principal_amount AS principalAmount,
         interest_amount AS interestAmount,
         balance_amount AS outstandingBalance,
         paid_amount AS paidAmount,
         status,
         paid_date AS paidDate
       FROM repayment_schedules
       WHERE loan_id = ?
       ORDER BY installment_no`,
      [loanId],
    );

    return rows;
  }

  async getDisbursementDetails(loanId) {
    const [rows] = await pool.execute(
      `SELECT
         l.loan_id AS loanId,
         l.loan_number AS loanNumber,
         l.disbursed_amount AS disbursedAmount,
         l.disbursement_date AS disbursementDate,
         lt.transaction_id AS transactionId,
         lt.transaction_date AS transactionDate,
         lt.reference_type AS referenceType,
         lt.reference_id AS referenceId,
         lt.remarks
       FROM loans l
       LEFT JOIN loan_transactions lt
         ON lt.loan_id = l.loan_id
        AND lt.transaction_type = 'DISBURSEMENT'
       WHERE l.loan_id = ?
       ORDER BY lt.created_at DESC
       LIMIT 1`,
      [loanId],
    );

    return rows[0] || null;
  }

  async getKycStatus(customerId) {
    const [rows] = await pool.execute(
      `SELECT
         c.aadhaar_number AS aadhaarNumber,
         c.pan_number AS panNumber,
         c.aadhaar_verified AS aadhaarVerified,
         c.pan_verified AS panVerified,
         COALESCE(ck.kyc_status, CASE WHEN c.aadhaar_verified = 1 THEN 'VERIFIED' ELSE 'PENDING' END) AS status,
         ck.verified_at AS verifiedAt,
         ck.remarks
       FROM customers c
       LEFT JOIN customer_kyc ck ON ck.customer_id = c.customer_id
       WHERE c.customer_id = ?
       LIMIT 1`,
      [customerId],
    );

    return rows[0] || null;
  }

  async updateDigiLockerKyc(customerId, { aadhaarNumber, digilockerRefId }) {
    await pool.execute(
      `UPDATE customers SET aadhaar_number = ?, aadhaar_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?`,
      [aadhaarNumber, customerId],
    );
    const remarks = `Verified via DigiLocker e-KYC (Ref: ${digilockerRefId || "DGL-" + Date.now()})`;
    await pool.execute(
      `INSERT INTO customer_kyc (customer_id, aadhaar_number, kyc_status, verified_at, remarks)
       VALUES (?, ?, 'VERIFIED', CURRENT_TIMESTAMP, ?)
       ON DUPLICATE KEY UPDATE 
         aadhaar_number = VALUES(aadhaar_number),
         kyc_status = 'VERIFIED',
         verified_at = CURRENT_TIMESTAMP,
         remarks = VALUES(remarks)`,
      [customerId, aadhaarNumber, remarks],
    );
    return { success: true, aadhaarNumber, aadhaarVerified: true, digilockerRefId };
  }

  async updatePanKyc(customerId, { panNumber }) {
    await pool.execute(
      `UPDATE customers SET pan_number = ?, pan_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?`,
      [panNumber, customerId],
    );
    await pool.execute(
      `INSERT INTO customer_kyc (customer_id, pan_number, remarks)
       VALUES (?, ?, 'Verified PAN via NSDL Check')
       ON DUPLICATE KEY UPDATE
         pan_number = VALUES(pan_number)`,
      [customerId, panNumber],
    );
    return { success: true, panNumber, panVerified: true };
  }
}

export default new CustomerPortalRepository();
