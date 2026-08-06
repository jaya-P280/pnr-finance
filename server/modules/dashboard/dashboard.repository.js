import db from "../../database/db.js";

class DashboardRepository {
  async getTotalCustomers(branchId) {
    const params = [];
    let sql = `SELECT COUNT(*) total FROM customers WHERE deleted_at IS NULL`;
    if (branchId) { sql += ` AND branch_id=?`; params.push(branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0]?.total || 0;
  }

  async getActiveLoans(branchId) {
    const params = [];
    let sql = `SELECT COUNT(*) total FROM loans WHERE status='ACTIVE'`;
    if (branchId) { sql += ` AND branch_id=?`; params.push(branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0]?.total || 0;
  }

  async getPendingApplications(branchId) {
    const params = [];
    let sql = `SELECT COUNT(*) total FROM loan_applications WHERE application_status='PENDING'`;
    if (branchId) { sql += ` AND branch_id=?`; params.push(branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0]?.total || 0;
  }

  async getOverdueLoans(branchId) {
    const params = [];
    let sql = `SELECT COUNT(*) total FROM loans WHERE status='ACTIVE' AND outstanding_amount>0 AND maturity_date<CURDATE()`;
    if (branchId) { sql += ` AND branch_id=?`; params.push(branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0]?.total || 0;
  }

  async getTodayCollection(branchId) {
    const params = [];
    let sql = `SELECT COALESCE(SUM(total_amount),0) total FROM collections WHERE DATE(collection_date)=CURDATE()`;
    if (branchId) { sql += ` AND branch_id=?`; params.push(branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0]?.total || 0;
  }

  async getMonthlyCollection(branchId) {
    const params = [];
    let sql = `SELECT COALESCE(SUM(total_amount),0) total FROM collections WHERE MONTH(collection_date)=MONTH(CURDATE()) AND YEAR(collection_date)=YEAR(CURDATE())`;
    if (branchId) { sql += ` AND branch_id=?`; params.push(branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0]?.total || 0;
  }

  async getMonthlyChart(branchId) {
    const params = [];
    let sql = `
      SELECT DATE_FORMAT(collection_date, '%Y-%m') as month, SUM(total_amount) as total
      FROM collections
      WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    `;
    if (branchId) { sql += ` AND branch_id=?`; params.push(branchId); }
    sql += ` GROUP BY month ORDER BY month ASC`;
    const [rows] = await db.query(sql, params);
    return rows || [];
  }

  async getBranchPerformance() {
    const [rows] = await db.query(`
      SELECT b.branch_id, b.branch_name,
        (SELECT COUNT(*) FROM customers c WHERE c.branch_id=b.branch_id AND c.deleted_at IS NULL) as total_customers,
        (SELECT COUNT(*) FROM loans l WHERE l.branch_id=b.branch_id AND l.status='ACTIVE') as active_loans,
        (SELECT COALESCE(SUM(l.principal_amount),0) FROM loans l WHERE l.branch_id=b.branch_id AND l.status='ACTIVE') as portfolio_size,
        (SELECT COALESCE(SUM(c.total_amount),0) FROM collections c WHERE c.branch_id=b.branch_id AND MONTH(c.collection_date)=MONTH(CURDATE()) AND YEAR(c.collection_date)=YEAR(CURDATE())) as monthly_collection
      FROM branches b WHERE b.deleted_at IS NULL ORDER BY b.branch_name
    `);
    return rows || [];
  }
}

export default new DashboardRepository();