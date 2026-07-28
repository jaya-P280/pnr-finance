import db from "../../database/db.js";

class CollectionRepository {
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

  async getLastReceiptNo() {
    const [rows] = await db.execute(
      `SELECT receipt_number FROM collections ORDER BY collection_id DESC LIMIT 1`,
    );
    return rows[0] || null;
  }

  async create(connection, data) {
    const [result] = await connection.execute(
      `INSERT INTO collections (receipt_number, loan_id, customer_id, branch_id, collected_by,
        collection_date, emi_amount, collection_amount, penalty_amount, total_amount,
        payment_method, reference_number, remarks, status, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.receiptNumber,
        data.loanId,
        data.customerId,
        data.branchId,
        data.collectedBy,
        data.collectionDate,
        data.emiAmount,
        data.collectionAmount,
        data.penaltyAmount || 0,
        data.totalAmount,
        data.paymentMethod || "CASH",
        data.referenceNumber || null,
        data.remarks || null,
        data.status || "COMPLETED",
        data.createdBy,
      ],
    );
    return result.insertId;
  }

  async findAll(filters) {
    const params = [];
    let sql = `
      SELECT c.*, l.loan_number,
        CONCAT(cust.first_name,' ',cust.last_name) as customer_name,
        b.branch_name,
        CONCAT(u.first_name,' ',u.last_name) as collector_name
      FROM collections c
      INNER JOIN loans l ON l.loan_id = c.loan_id
      INNER JOIN customers cust ON cust.customer_id = c.customer_id
      INNER JOIN branches b ON b.branch_id = c.branch_id
      LEFT JOIN users u ON u.user_id = c.collected_by
      WHERE 1=1
    `;
    if (filters.search) {
      sql += ` AND (c.receipt_number LIKE ? OR l.loan_number LIKE ? OR CONCAT(cust.first_name,' ',cust.last_name) LIKE ?)`;
      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`,
        `%${filters.search}%`,
      );
    }
    if (filters.loanId) {
      sql += ` AND c.loan_id=?`;
      params.push(filters.loanId);
    }
    if (filters.branchId) {
      sql += ` AND c.branch_id=?`;
      params.push(filters.branchId);
    }
    if (filters.status) {
      sql += ` AND c.status=?`;
      params.push(filters.status);
    }
    if (filters.fromDate) {
      sql += ` AND DATE(c.collection_date)>=?`;
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      sql += ` AND DATE(c.collection_date)<=?`;
      params.push(filters.toDate);
    }
    sql += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(filters.limit, (filters.page - 1) * filters.limit);
    const [rows] = await db.query(sql, params);
    return rows;
  }

  async count(filters) {
    const params = [];
    let sql = `SELECT COUNT(*) total FROM collections c WHERE 1=1`;
    if (filters.search) {
      sql += ` AND (c.receipt_number LIKE ? OR c.loan_id LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.loanId) {
      sql += ` AND c.loan_id=?`;
      params.push(filters.loanId);
    }
    if (filters.branchId) {
      sql += ` AND c.branch_id=?`;
      params.push(filters.branchId);
    }
    if (filters.status) {
      sql += ` AND c.status=?`;
      params.push(filters.status);
    }
    if (filters.fromDate) {
      sql += ` AND DATE(c.collection_date)>=?`;
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      sql += ` AND DATE(c.collection_date)<=?`;
      params.push(filters.toDate);
    }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT c.*, l.loan_number,
        CONCAT(cust.first_name,' ',cust.last_name) as customer_name,
        b.branch_name,
        CONCAT(u.first_name,' ',u.last_name) as collector_name
       FROM collections c
       INNER JOIN loans l ON l.loan_id = c.loan_id
       INNER JOIN customers cust ON cust.customer_id = c.customer_id
       INNER JOIN branches b ON b.branch_id = c.branch_id
       LEFT JOIN users u ON u.user_id = c.collected_by
       WHERE c.collection_id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  async update(connection, id, data) {
    await connection.execute(
      `UPDATE collections SET collection_amount=?, penalty_amount=?, total_amount=?,
        payment_method=?, reference_number=?, remarks=?, status=?, updated_by=?
       WHERE collection_id=?`,
      [
        data.collectionAmount,
        data.penaltyAmount || 0,
        data.totalAmount,
        data.paymentMethod || "CASH",
        data.referenceNumber || null,
        data.remarks || null,
        data.status || "COMPLETED",
        data.updatedBy,
        id,
      ],
    );
  }

  async delete(connection, id) {
    await connection.execute(`DELETE FROM collections WHERE collection_id=?`, [
      id,
    ]);
  }

  // Dashboard / Reports
  async getTodayCollection(branchId) {
    let sql = `SELECT COALESCE(SUM(total_amount),0) total FROM collections WHERE DATE(collection_date)=CURDATE()`;
    const params = [];
    if (branchId) {
      sql += ` AND branch_id=?`;
      params.push(branchId);
    }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }

  async getMonthlyCollection(branchId) {
    let sql = `SELECT COALESCE(SUM(total_amount),0) total FROM collections WHERE MONTH(collection_date)=MONTH(CURDATE()) AND YEAR(collection_date)=YEAR(CURDATE())`;
    const params = [];
    if (branchId) {
      sql += ` AND branch_id=?`;
      params.push(branchId);
    }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }

  async getOverdueTotal(branchId) {
    let sql = `SELECT COALESCE(SUM(outstanding_amount),0) total FROM loans WHERE status='ACTIVE' AND outstanding_amount>0 AND maturity_date < CURDATE()`;
    const params = [];
    if (branchId) {
      sql += ` AND branch_id=?`;
      params.push(branchId);
    }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }

  async getCollectionChartData(branchId, months = 6) {
    let sql = `
      SELECT DATE_FORMAT(collection_date, '%Y-%m') as month, SUM(total_amount) as total
      FROM collections
      WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    `;
    const params = [months];
    if (branchId) {
      sql += ` AND branch_id=?`;
      params.push(branchId);
    }
    sql += ` GROUP BY DATE_FORMAT(collection_date, '%Y-%m') ORDER BY month ASC`;
    const [rows] = await db.query(sql, params);
    return rows;
  }
}

export default new CollectionRepository();
