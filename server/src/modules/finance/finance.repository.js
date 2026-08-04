import db from "../../database/db.js";

class FinanceRepository {
  // --- EXPENSES ---
  async getLastExpenseNo() {
    const [rows] = await db.execute(
      `SELECT expense_number FROM expenses ORDER BY expense_id DESC LIMIT 1`
    );
    return rows[0] || null;
  }

  async createExpense(data) {
    const [result] = await db.execute(
      `INSERT INTO expenses (expense_number, category, amount, payment_method, expense_date, paid_to, branch_id, receipt_ref, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.expenseNumber,
        data.category,
        data.amount,
        data.paymentMethod || "CASH",
        data.expenseDate,
        data.paidTo || null,
        data.branchId || 1,
        data.receiptRef || null,
        data.description || null,
        data.createdBy || null,
      ]
    );
    return result.insertId;
  }

  async getExpenses(filters) {
    const params = [];
    let sql = `
      SELECT e.*, b.branch_name, CONCAT(u.first_name, ' ', u.last_name) AS creator_name
      FROM expenses e
      LEFT JOIN branches b ON b.branch_id = e.branch_id
      LEFT JOIN users u ON u.user_id = e.created_by
      WHERE 1=1
    `;

    if (filters.search) {
      sql += ` AND (e.expense_number LIKE ? OR e.paid_to LIKE ? OR e.category LIKE ? OR e.description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.category) {
      sql += ` AND e.category = ?`;
      params.push(filters.category);
    }
    if (filters.branchId) {
      sql += ` AND e.branch_id = ?`;
      params.push(filters.branchId);
    }
    if (filters.fromDate) {
      sql += ` AND DATE(e.expense_date) >= ?`;
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      sql += ` AND DATE(e.expense_date) <= ?`;
      params.push(filters.toDate);
    }

    sql += ` ORDER BY e.expense_date DESC, e.expense_id DESC`;

    const limit = parseInt(filters.limit || 50, 10);
    const page = parseInt(filters.page || 1, 10);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const [rows] = await db.query(sql, params);
    return rows;
  }

  async countExpenses(filters) {
    const params = [];
    let sql = `SELECT COUNT(*) AS total, COALESCE(SUM(amount), 0) AS total_amount FROM expenses e WHERE 1=1`;

    if (filters.search) {
      sql += ` AND (e.expense_number LIKE ? OR e.paid_to LIKE ? OR e.category LIKE ? OR e.description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.category) {
      sql += ` AND e.category = ?`;
      params.push(filters.category);
    }
    if (filters.branchId) {
      sql += ` AND e.branch_id = ?`;
      params.push(filters.branchId);
    }
    if (filters.fromDate) {
      sql += ` AND DATE(e.expense_date) >= ?`;
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      sql += ` AND DATE(e.expense_date) <= ?`;
      params.push(filters.toDate);
    }

    const [rows] = await db.execute(sql, params);
    return rows[0] || { total: 0, total_amount: 0 };
  }

  async deleteExpense(id) {
    await db.execute(`DELETE FROM expenses WHERE expense_id = ?`, [id]);
  }

  // --- INCOME ---
  async getLastIncomeNo() {
    const [rows] = await db.execute(
      `SELECT income_number FROM income ORDER BY income_id DESC LIMIT 1`
    );
    return rows[0] || null;
  }

  async createIncome(data) {
    const [result] = await db.execute(
      `INSERT INTO income (income_number, category, amount, payment_method, income_date, received_from, branch_id, receipt_ref, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.incomeNumber,
        data.category,
        data.amount,
        data.paymentMethod || "CASH",
        data.incomeDate,
        data.receivedFrom || null,
        data.branchId || 1,
        data.receiptRef || null,
        data.description || null,
        data.createdBy || null,
      ]
    );
    return result.insertId;
  }

  async getIncome(filters) {
    const params = [];
    let sql = `
      SELECT i.*, b.branch_name, CONCAT(u.first_name, ' ', u.last_name) AS creator_name
      FROM income i
      LEFT JOIN branches b ON b.branch_id = i.branch_id
      LEFT JOIN users u ON u.user_id = i.created_by
      WHERE 1=1
    `;

    if (filters.search) {
      sql += ` AND (i.income_number LIKE ? OR i.received_from LIKE ? OR i.category LIKE ? OR i.description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.category) {
      sql += ` AND i.category = ?`;
      params.push(filters.category);
    }
    if (filters.branchId) {
      sql += ` AND i.branch_id = ?`;
      params.push(filters.branchId);
    }
    if (filters.fromDate) {
      sql += ` AND DATE(i.income_date) >= ?`;
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      sql += ` AND DATE(i.income_date) <= ?`;
      params.push(filters.toDate);
    }

    sql += ` ORDER BY i.income_date DESC, i.income_id DESC`;

    const limit = parseInt(filters.limit || 50, 10);
    const page = parseInt(filters.page || 1, 10);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const [rows] = await db.query(sql, params);
    return rows;
  }

  async countIncome(filters) {
    const params = [];
    let sql = `SELECT COUNT(*) AS total, COALESCE(SUM(amount), 0) AS total_amount FROM income i WHERE 1=1`;

    if (filters.search) {
      sql += ` AND (i.income_number LIKE ? OR i.received_from LIKE ? OR i.category LIKE ? OR i.description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.category) {
      sql += ` AND i.category = ?`;
      params.push(filters.category);
    }
    if (filters.branchId) {
      sql += ` AND i.branch_id = ?`;
      params.push(filters.branchId);
    }
    if (filters.fromDate) {
      sql += ` AND DATE(i.income_date) >= ?`;
      params.push(filters.fromDate);
    }
    if (filters.toDate) {
      sql += ` AND DATE(i.income_date) <= ?`;
      params.push(filters.toDate);
    }

    const [rows] = await db.execute(sql, params);
    return rows[0] || { total: 0, total_amount: 0 };
  }

  async deleteIncome(id) {
    await db.execute(`DELETE FROM income WHERE income_id = ?`, [id]);
  }

  // --- CASH BOOK UNIFIED LEDGER ---
  async getCashBookLedger(filters) {
    const branchClause = filters.branchId ? `AND branch_id = ${parseInt(filters.branchId, 10)}` : "";
    const fromClause = filters.fromDate ? `'${filters.fromDate}'` : null;
    const toClause = filters.toDate ? `'${filters.toDate}'` : null;

    let dateCondColl = "";
    let dateCondInc = "";
    let dateCondLoan = "";
    let dateCondExp = "";

    if (fromClause && toClause) {
      dateCondColl = `AND DATE(collection_date) BETWEEN ${fromClause} AND ${toClause}`;
      dateCondInc = `AND DATE(income_date) BETWEEN ${fromClause} AND ${toClause}`;
      dateCondLoan = `AND DATE(disbursement_date) BETWEEN ${fromClause} AND ${toClause}`;
      dateCondExp = `AND DATE(expense_date) BETWEEN ${fromClause} AND ${toClause}`;
    }

    const unionSql = `
      SELECT
        'INFLOW' AS entry_type,
        'EMI Collection' AS category,
        receipt_number AS ref_number,
        total_amount AS amount,
        payment_method,
        collection_date AS entry_date,
        remarks AS description
      FROM collections
      WHERE 1=1 ${branchClause} ${dateCondColl}

      UNION ALL

      SELECT
        'INFLOW' AS entry_type,
        category,
        income_number AS ref_number,
        amount,
        payment_method,
        income_date AS entry_date,
        description
      FROM income
      WHERE 1=1 ${branchClause} ${dateCondInc}

      UNION ALL

      SELECT
        'OUTFLOW' AS entry_type,
        'Loan Disbursement' AS category,
        loan_number AS ref_number,
        disbursed_amount AS amount,
        'BANK_TRANSFER' AS payment_method,
        disbursement_date AS entry_date,
        remarks AS description
      FROM loans
      WHERE status IN ('ACTIVE', 'CLOSED') ${branchClause} ${dateCondLoan}

      UNION ALL

      SELECT
        'OUTFLOW' AS entry_type,
        category,
        expense_number AS ref_number,
        amount,
        payment_method,
        expense_date AS entry_date,
        description
      FROM expenses
      WHERE 1=1 ${branchClause} ${dateCondExp}

      ORDER BY entry_date DESC
    `;

    const [rows] = await db.query(unionSql);

    let totalInflow = 0;
    let totalOutflow = 0;
    let todayInflow = 0;
    let todayOutflow = 0;
    const todayStr = new Date().toISOString().split("T")[0];

    rows.forEach((row) => {
      const amt = parseFloat(row.amount || 0);
      const isToday = row.entry_date && String(row.entry_date).startsWith(todayStr);

      if (row.entry_type === "INFLOW") {
        totalInflow += amt;
        if (isToday) todayInflow += amt;
      } else {
        totalOutflow += amt;
        if (isToday) todayOutflow += amt;
      }
    });

    const netBalance = totalInflow - totalOutflow;

    return {
      entries: rows,
      summary: {
        totalInflow,
        totalOutflow,
        netBalance,
        todayInflow,
        todayOutflow,
      },
    };
  }
}

export default new FinanceRepository();
