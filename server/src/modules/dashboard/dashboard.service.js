import db from "../../database/db.js";

class DashboardService {
  async getStats(branchId) {
    const params = [];
    let customerWhere = "", loanWhere = "", collectionWhere = "";

    if (branchId) {
      customerWhere = "WHERE branch_id=?";
      loanWhere = "WHERE branch_id=?";
      collectionWhere = "WHERE branch_id=?";
      params.push(branchId, branchId, branchId);
    }

    const [totalCustomers] = await db.execute(`SELECT COUNT(*) total FROM customers ${customerWhere} AND deleted_at IS NULL`, branchId ? [branchId] : []);
    const [activeLoans] = await db.execute(`SELECT COUNT(*) total FROM loans ${loanWhere} AND status='ACTIVE'`, branchId ? [branchId] : []);
    const [pendingApplications] = await db.execute(`SELECT COUNT(*) total FROM loan_applications WHERE application_status='PENDING'`);
    const [overdueLoans] = await db.execute(`SELECT COUNT(*) total FROM loans ${loanWhere} AND status='ACTIVE' AND outstanding_amount>0 AND maturity_date<CURDATE()`, branchId ? [branchId] : []);
    const [todayCollection] = await db.execute(`SELECT COALESCE(SUM(total_amount),0) total FROM collections WHERE DATE(collection_date)=CURDATE()`);
    const [monthlyCollection] = await db.execute(`SELECT COALESCE(SUM(total_amount),0) total FROM collections WHERE MONTH(collection_date)=MONTH(CURDATE()) AND YEAR(collection_date)=YEAR(CURDATE())`);

    // Monthly collection chart (last 6 months)
    const [monthlyChart] = await db.query(`
      SELECT DATE_FORMAT(collection_date, '%Y-%m') as month, SUM(total_amount) as total
      FROM collections
      WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(collection_date, '%Y-%m') ORDER BY month ASC
    `);

    // Branch performance
    const [branchPerformance] = await db.query(`
      SELECT b.branch_id, b.branch_name,
        (SELECT COUNT(*) FROM customers c WHERE c.branch_id=b.branch_id AND c.deleted_at IS NULL) as total_customers,
        (SELECT COUNT(*) FROM loans l WHERE l.branch_id=b.branch_id AND l.status='ACTIVE') as active_loans,
        (SELECT COALESCE(SUM(l.principal_amount),0) FROM loans l WHERE l.branch_id=b.branch_id AND l.status='ACTIVE') as portfolio_size,
        (SELECT COALESCE(SUM(c.total_amount),0) FROM collections c WHERE c.branch_id=b.branch_id AND MONTH(c.collection_date)=MONTH(CURDATE()) AND YEAR(c.collection_date)=YEAR(CURDATE())) as monthly_collection
      FROM branches b WHERE b.deleted_at IS NULL ORDER BY b.branch_name
    `);

    return {
      totalCustomers: totalCustomers[0].total,
      activeLoans: activeLoans[0].total,
      pendingApplications: pendingApplications[0].total,
      overdueLoans: overdueLoans[0].total,
      todayCollection: todayCollection[0].total,
      monthlyCollection: monthlyCollection[0].total,
      monthlyChart,
      branchPerformance,
    };
  }
}

export default new DashboardService();