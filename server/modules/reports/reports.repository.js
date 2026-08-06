import db from "../../database/db.js";

class ReportsRepository {
  async getLoanReport(filters) {
    const params = [];
    let sql = `
      SELECT l.loan_id, l.loan_number, l.principal_amount, l.disbursed_amount,
        l.outstanding_amount, l.interest_rate, l.tenure, l.status,
        l.disbursement_date, l.maturity_date, l.created_at,
        CONCAT(c.first_name,' ',c.last_name) customer_name, c.mobile_number,
        b.branch_name, lp.product_name
      FROM loans l
      INNER JOIN customers c ON c.customer_id=l.customer_id
      INNER JOIN branches b ON b.branch_id=l.branch_id
      INNER JOIN loan_products lp ON lp.loan_product_id=l.loan_product_id
      WHERE 1=1
    `;
    if (filters.status) {
      sql += ` AND l.status=?`;
      params.push(filters.status);
    }
    if (filters.branchId) {
      sql += ` AND l.branch_id=?`;
      params.push(filters.branchId);
    }
    if (filters.fromDate) {
      sql += ` AND DATE(l.disbursement_date)>=?`;
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      sql += ` AND DATE(l.disbursement_date)<=?`;
      params.push(filters.toDate);
    }
    sql += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    params.push(filters.limit, filters.offset);
    return await db.query(sql, params);
  }

  async countLoans(filters = {}) {
    let sql = `SELECT COUNT(*) total FROM loans WHERE deleted_at IS NULL`;
    const params = [];
    if (filters.branchId) {
      sql += ` AND branch_id = ?`;
      params.push(filters.branchId);
    }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }

  async getCollectionReport(filters) {
    const params = [];
    let sql = `
      SELECT c.collection_id, c.receipt_number, c.collection_date,
        c.collection_amount, c.penalty_amount, c.total_amount, c.status,
        CONCAT(cust.first_name, ' ', cust.last_name) AS customer_name,
        b.branch_name
      FROM collections c
      INNER JOIN customers cust ON cust.customer_id = c.customer_id
      INNER JOIN branches b ON b.branch_id = c.branch_id
      WHERE 1 = 1`;
    if (filters.branchId) { sql += ` AND c.branch_id = ?`; params.push(filters.branchId); }
    if (filters.fromDate) { sql += ` AND DATE(c.collection_date) >= ?`; params.push(filters.fromDate); }
    if (filters.toDate) { sql += ` AND DATE(c.collection_date) <= ?`; params.push(filters.toDate); }
    sql += ` ORDER BY c.collection_date DESC LIMIT ? OFFSET ?`;
    params.push(filters.limit, filters.offset);
    return db.query(sql, params);
  }
  async countCollections(filters = {}) {
    let sql = `SELECT COUNT(*) total FROM collections WHERE 1 = 1`;
    const params = [];
    if (filters.branchId) { sql += ` AND branch_id = ?`; params.push(filters.branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }
  async getCustomerReport(filters) {
    const params = [];
    let sql = `
      SELECT c.customer_id, c.customer_code, c.first_name, c.last_name,
        c.mobile_number, c.status, c.created_at, b.branch_name
      FROM customers c
      INNER JOIN branches b ON b.branch_id = c.branch_id
      WHERE c.deleted_at IS NULL`;
    if (filters.branchId) { sql += ` AND c.branch_id = ?`; params.push(filters.branchId); }
    sql += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(filters.limit, filters.offset);
    return db.query(sql, params);
  }
  async countCustomers(filters = {}) {
    let sql = `SELECT COUNT(*) total FROM customers WHERE deleted_at IS NULL`;
    const params = [];
    if (filters.branchId) { sql += ` AND branch_id = ?`; params.push(filters.branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }
  async getRecoveryReport(branchId) {
    let sql = `
      SELECT COUNT(*) AS active_loans,
        COALESCE(SUM(outstanding_amount), 0) AS outstanding_amount,
        COALESCE(SUM(CASE WHEN maturity_date < CURDATE() THEN outstanding_amount ELSE 0 END), 0) AS overdue_amount
      FROM loans
      WHERE deleted_at IS NULL AND status = 'ACTIVE'`;
    const params = [];
    if (branchId) { sql += ` AND branch_id = ?`; params.push(branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0];
  }
}

export default new ReportsRepository();
