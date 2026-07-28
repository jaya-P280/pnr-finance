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

  async countLoans() {
    const [rows] = await db.execute(`SELECT COUNT(*) total FROM loans`);
    return rows[0].total;
  }

  // ... similar for collections, customers, recovery
  async getCollectionReport(filters) {
    /* ... */
  }
  async countCollections() {
    /* ... */
  }
  async getCustomerReport(filters) {
    /* ... */
  }
  async countCustomers() {
    /* ... */
  }
  async getRecoveryReport(branchId) {
    /* ... */
  }
}

export default new ReportsRepository();
