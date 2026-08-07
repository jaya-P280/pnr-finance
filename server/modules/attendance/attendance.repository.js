import pool from "../../database/db.js";

class AttendanceRepository {
  async findRecord(userId, date) {
    const [rows] = await pool.execute(
      `SELECT * FROM employee_attendance WHERE user_id = ? AND attendance_date = ?`,
      [userId, date]
    );
    return rows[0] || null;
  }

  async markAttendance({ userId, branchId, attendanceDate, clockIn, clockOut, status, remarks, recordedBy }) {
    const existing = await this.findRecord(userId, attendanceDate);
    if (existing) {
      await pool.execute(
        `UPDATE employee_attendance 
         SET clock_in = COALESCE(?, clock_in),
             clock_out = COALESCE(?, clock_out),
             status = COALESCE(?, status),
             remarks = COALESCE(?, remarks),
             recorded_by = ?,
             updated_at = NOW()
         WHERE attendance_id = ?`,
        [clockIn || null, clockOut || null, status || null, remarks || null, recordedBy, existing.attendance_id]
      );
      return existing.attendance_id;
    } else {
      const [res] = await pool.execute(
        `INSERT INTO employee_attendance (user_id, branch_id, attendance_date, clock_in, clock_out, status, remarks, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, branchId || null, attendanceDate, clockIn || null, clockOut || null, status || "PRESENT", remarks || null, recordedBy]
      );
      return res.insertId;
    }
  }

  async getAllAttendance({ date, month, year, branchId, userId, status }) {
    let sql = `
      SELECT 
        a.attendance_id,
        a.user_id,
        a.branch_id,
        a.attendance_date,
        a.clock_in,
        a.clock_out,
        a.status,
        a.remarks,
        a.created_at,
        u.first_name,
        u.last_name,
        u.employee_code,
        u.email,
        r.role_name,
        b.branch_name
      FROM employee_attendance a
      INNER JOIN users u ON u.user_id = a.user_id
      LEFT JOIN roles r ON r.role_id = u.role_id
      LEFT JOIN branches b ON b.branch_id = a.branch_id
      WHERE u.deleted_at IS NULL
    `;
    const params = [];

    if (date) {
      sql += ` AND a.attendance_date = ?`;
      params.push(date);
    }
    if (month && year) {
      sql += ` AND MONTH(a.attendance_date) = ? AND YEAR(a.attendance_date) = ?`;
      params.push(month, year);
    }
    if (branchId) {
      sql += ` AND a.branch_id = ?`;
      params.push(branchId);
    }
    if (userId) {
      sql += ` AND a.user_id = ?`;
      params.push(userId);
    }
    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY a.attendance_date DESC, u.first_name ASC`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async getSummary({ date, month, year, branchId, userId }) {
    const targetDate = date || new Date().toISOString().split("T")[0];
    let sql = `
      SELECT 
        COUNT(a.attendance_id) as total_marked,
        SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN a.status = 'HALF_DAY' THEN 1 ELSE 0 END) as half_day_count,
        SUM(CASE WHEN a.status = 'ON_LEAVE' THEN 1 ELSE 0 END) as on_leave_count
      FROM employee_attendance a
      WHERE a.attendance_date = ?
    `;
    const params = [targetDate];

    if (branchId) {
      sql += ` AND a.branch_id = ?`;
      params.push(branchId);
    }
    if (userId) {
      sql += ` AND a.user_id = ?`;
      params.push(userId);
    }

    const [rows] = await pool.execute(sql, params);
    return rows[0] || {};
  }
}

export default new AttendanceRepository();
