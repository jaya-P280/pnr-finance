import pool from "../../database/db.js";

export const getSalaries = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.user_id,
        u.employee_code,
        u.first_name,
        u.last_name,
        u.email,
        u.mobile_number AS phone,
        r.role_name AS role,
        b.branch_name AS branch,
        s.basic_salary,
        s.hra,
        s.allowances,
        s.pf_deduction,
        s.tax_deduction,
        s.net_salary,
        s.effective_date,
        p.payroll_number,
        p.month_year,
        p.payment_status,
        p.payment_date,
        p.payment_method
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN branches b ON u.branch_id = b.branch_id
      LEFT JOIN employee_salaries s ON u.user_id = s.user_id
      LEFT JOIN payroll_logs p ON u.user_id = p.user_id AND p.payroll_id = (
        SELECT MAX(payroll_id) FROM payroll_logs WHERE user_id = u.user_id
      )
      WHERE COALESCE(r.role_name, '') != 'CUSTOMER'
      ORDER BY u.user_id ASC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSalaryStructure = async (req, res, next) => {
  try {
    const { userId, basicSalary, hra, allowances, pfDeduction, taxDeduction } = req.body;
    const netSalary = Math.max(0, Number(basicSalary || 0) + Number(hra || 0) + Number(allowances || 0) - Number(pfDeduction || 0) - Number(taxDeduction || 0));

    await pool.execute(
      `INSERT INTO employee_salaries (user_id, basic_salary, hra, allowances, pf_deduction, tax_deduction, net_salary, effective_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
       ON DUPLICATE KEY UPDATE
         basic_salary = VALUES(basic_salary),
         hra = VALUES(hra),
         allowances = VALUES(allowances),
         pf_deduction = VALUES(pf_deduction),
         tax_deduction = VALUES(tax_deduction),
         net_salary = VALUES(net_salary),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, basicSalary, hra, allowances, pfDeduction, taxDeduction || 0, netSalary]
    );

    res.json({
      success: true,
      message: "Salary structure updated successfully in database",
    });
  } catch (error) {
    next(error);
  }
};

export const processPayroll = async (req, res, next) => {
  try {
    const { userId, monthYear, paymentMethod, referenceNo, remarks } = req.body;
    const [salRows] = await pool.execute(`SELECT * FROM employee_salaries WHERE user_id = ?`, [userId]);
    const sal = salRows[0] || { basic_salary: 25000, hra: 5000, allowances: 3000, pf_deduction: 1800, net_salary: 31200 };

    const payrollNumber = `PAY-${Date.now().toString().slice(-6)}`;

    await pool.execute(
      `INSERT INTO payroll_logs (payroll_number, user_id, month_year, basic_salary, hra, allowances, deductions, net_payable, payment_method, payment_date, payment_status, reference_no, remarks, processed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'PAID', ?, ?, ?)`,
      [payrollNumber, userId, monthYear || "August 2026", sal.basic_salary, sal.hra, sal.allowances, sal.pf_deduction, sal.net_salary, paymentMethod || "BANK_TRANSFER", referenceNo || `TXN-${Date.now()}`, remarks || "Monthly Payout", req.user?.userId || 1]
    );

    res.json({
      success: true,
      message: "Payroll payout processed and recorded in database",
    });
  } catch (error) {
    next(error);
  }
};
