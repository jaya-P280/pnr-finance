import db from "../../database/db.js";

class DashboardRepository {
  async getTotalCustomers(branchId) {
    const params = [];
    let sql = `SELECT COUNT(*) total FROM customers WHERE deleted_at IS NULL`;
    if (branchId) { sql += ` AND branch_id=?`; params.push(branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }

  async getActiveLoans(branchId) {
    const params = [];
    let sql = `SELECT COUNT(*) total FROM loans WHERE status='ACTIVE'`;
    if (branchId) { sql += ` AND branch_id=?`; params.push(branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }

  async getPendingApplications() {
    const [rows] = await db.execute(`SELECT COUNT(*) total FROM loan_applications WHERE application_status='PENDING'`);
    return rows[0].total;
  }

  async getOverdueLoans(branchId) {
    const params = [];
    let sql = `SELECT COUNT(*) total FROM loans WHERE status='ACTIVE' AND outstanding_amount>0 AND maturity_date<CURDATE()`;
    if (branchId) { sql += ` AND branch_id=?`; params.push(branchId); }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }

  async getTodayCollection() {
    const [rows] = await db.execute(`SELECT COALESCE(SUM(total_amount),0) total FROM collections WHERE DATE(collection_date)=CURDATE()`);
    return rows[0].total;
  }

  async getMonthlyCollection() {
    const [rows] = await db.execute(`SELECT COALESCE(SUM(total_amount),0) total FROM collections WHERE MONTH(collection_date)=MONTH(CURDATE()) AND YEAR(collection_date)=YEAR(CURDATE())`);
    return rows[0].total;
  }

  async getMonthlyChart() {
    const [rows] = await db.query(`
      SELECT DATE_FORMAT(collection_date, '%Y-%m') as month, SUM(total_amount) as total
      FROM collections
      WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month ASC
    `);
    return rows;
  }

  async getTodayExpenses() {
    const [rows] = await db.execute(`SELECT COALESCE(SUM(amount),0) total FROM expenses WHERE DATE(expense_date)=CURDATE() OR DATE(created_at)=CURDATE()`);
    return rows[0].total;
  }

  async getPendingKycCount() {
    const [rows] = await db.execute(`SELECT COUNT(*) total FROM customers WHERE status='PENDING' OR pan_number IS NULL OR aadhaar_number IS NULL`);
    return rows[0].total;
  }

  async getTotalStaffCount() {
    const [rows] = await db.execute(`SELECT COUNT(*) total FROM users u INNER JOIN roles r ON u.role_id=r.role_id WHERE r.role_name!='CUSTOMER'`);
    return rows[0].total;
  }

  async getRecentFinancialLedger() {
    const [rows] = await db.query(`
      (SELECT income_number as code, category as description, 'INCOME' as type, amount, payment_method, created_at FROM income ORDER BY created_at DESC LIMIT 3)
      UNION ALL
      (SELECT expense_number as code, category as description, 'EXPENSE' as type, amount, payment_method, created_at FROM expenses ORDER BY created_at DESC LIMIT 3)
      ORDER BY created_at DESC LIMIT 5
    `);
    return rows;
  }

  async getRecentKycQueue() {
    const [rows] = await db.query(`
      SELECT customer_id, customer_code, first_name, last_name, mobile_number, aadhaar_number, pan_number, 'PENDING' as kyc_status
      FROM customers ORDER BY created_at DESC LIMIT 5
    `);
    return rows;
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
    return rows;
  }
}

export default new DashboardRepository();