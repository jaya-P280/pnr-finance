import db from "../../database/db.js";
import PaginationHelper from "../../shared/pagination.helper.js";

class ReportsService {
  async getLoanReport(query) {
    const { page, limit } = PaginationHelper.build(query);
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
    if (query.status) { sql += ` AND l.status=?`; params.push(query.status); }
    if (query.branchId) { sql += ` AND l.branch_id=?`; params.push(query.branchId); }
    if (query.fromDate) { sql += ` AND DATE(l.disbursement_date)>=?`; params.push(query.fromDate); }
    if (query.toDate) { sql += ` AND DATE(l.disbursement_date)<=?`; params.push(query.toDate); }
    if (query.search) { sql += ` AND (l.loan_number LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)`;
      params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`); }
    sql += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);
    const [rows] = await db.query(sql, params);

    const [countResult] = await db.execute(`SELECT COUNT(*) total FROM loans`, []);
    return { reports: rows, pagination: PaginationHelper.metadata(page, limit, countResult[0].total) };
  }

  async getCollectionReport(query) {
    const { page, limit } = PaginationHelper.build(query);
    const params = [];
    let sql = `
      SELECT c.*, l.loan_number, CONCAT(cust.first_name,' ',cust.last_name) customer_name, b.branch_name
      FROM collections c
      INNER JOIN loans l ON l.loan_id=c.loan_id
      INNER JOIN customers cust ON cust.customer_id=c.customer_id
      INNER JOIN branches b ON b.branch_id=c.branch_id
      WHERE 1=1
    `;
    if (query.branchId) { sql += ` AND c.branch_id=?`; params.push(query.branchId); }
    if (query.fromDate) { sql += ` AND DATE(c.collection_date)>=?`; params.push(query.fromDate); }
    if (query.toDate) { sql += ` AND DATE(c.collection_date)<=?`; params.push(query.toDate); }
    sql += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);
    const [rows] = await db.query(sql, params);
    const [countResult] = await db.execute(`SELECT COUNT(*) total FROM collections`, []);
    return { reports: rows, pagination: PaginationHelper.metadata(page, limit, countResult[0].total) };
  }

  async getCustomerReport(query) {
    const { page, limit } = PaginationHelper.build(query);
    const params = [];
    let sql = `
      SELECT c.*, b.branch_name,
        (SELECT COUNT(*) FROM loans l WHERE l.customer_id=c.customer_id) as total_loans,
        (SELECT COALESCE(SUM(l.principal_amount),0) FROM loans l WHERE l.customer_id=c.customer_id AND l.status='ACTIVE') as active_loan_amount
      FROM customers c
      INNER JOIN branches b ON b.branch_id=c.branch_id
      WHERE c.deleted_at IS NULL
    `;
    if (query.branchId) { sql += ` AND c.branch_id=?`; params.push(query.branchId); }
    if (query.search) { sql += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.mobile_number LIKE ?)`;
      params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`); }
    sql += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);
    const [rows] = await db.query(sql, params);
    const [countResult] = await db.execute(`SELECT COUNT(*) total FROM customers WHERE deleted_at IS NULL`, []);
    return { reports: rows, pagination: PaginationHelper.metadata(page, limit, countResult[0].total) };
  }

  async getRecoveryReport(query) {
    let sql = `
      SELECT b.branch_name,
        COUNT(DISTINCT l.loan_id) as total_loans,
        COALESCE(SUM(l.principal_amount),0) as total_disbursed,
        COALESCE(SUM(c.total_amount),0) as total_collected,
        COALESCE(SUM(l.outstanding_amount),0) as total_outstanding,
        CASE WHEN COALESCE(SUM(l.principal_amount),0) > 0
          THEN ROUND((COALESCE(SUM(c.total_amount),0) / COALESCE(SUM(l.principal_amount),0)) * 100, 2)
          ELSE 0 END as recovery_rate
      FROM branches b
      LEFT JOIN loans l ON l.branch_id=b.branch_id
      LEFT JOIN collections c ON c.branch_id=b.branch_id
      WHERE b.deleted_at IS NULL
    `;
    if (query.branchId) { sql += ` AND b.branch_id=?`; }
    sql += ` GROUP BY b.branch_id, b.branch_name ORDER BY b.branch_name`;
    const params = query.branchId ? [query.branchId] : [];
    const [rows] = await db.query(sql, params);
    return rows;
  }
}

export default new ReportsService();