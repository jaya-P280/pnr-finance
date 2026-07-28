import db from "../../database/db.js";

class GroupRepository {
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

  async getLastGroupCode() {
    const [rows] = await db.execute(`
      SELECT group_code FROM customer_groups
      ORDER BY group_id DESC LIMIT 1
    `);
    return rows[0] || null;
  }

  async create(connection, data) {
    const [result] = await connection.execute(
      `INSERT INTO customer_groups (group_code, group_name, branch_id, description, meeting_day, status, created_by)
       VALUES (?,?,?,?,?,?,?)`,
      [data.groupCode, data.groupName, data.branchId, data.description || null, data.meetingDay || null, data.status || "ACTIVE", data.createdBy],
    );
    return result.insertId;
  }

  async findAll(filters) {
    const params = [];
    let sql = `
      SELECT cg.*, b.branch_name,
        (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = cg.group_id AND gm.deleted_at IS NULL) AS member_count,
        (SELECT COUNT(*) FROM loans l WHERE l.group_id = cg.group_id AND l.status = 'ACTIVE') AS active_loans
      FROM customer_groups cg
      INNER JOIN branches b ON b.branch_id = cg.branch_id
      WHERE cg.deleted_at IS NULL
    `;
    if (filters.search) {
      sql += ` AND (cg.group_name LIKE ? OR cg.group_code LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.branchId) {
      sql += ` AND cg.branch_id = ?`;
      params.push(filters.branchId);
    }
    if (filters.status) {
      sql += ` AND cg.status = ?`;
      params.push(filters.status);
    }
    sql += ` ORDER BY cg.created_at DESC LIMIT ? OFFSET ?`;
    params.push(filters.limit, (filters.page - 1) * filters.limit);
    const [rows] = await db.query(sql, params);
    return rows;
  }

  async count(filters) {
    const params = [];
    let sql = `SELECT COUNT(*) total FROM customer_groups cg WHERE cg.deleted_at IS NULL`;
    if (filters.search) {
      sql += ` AND (cg.group_name LIKE ? OR cg.group_code LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.branchId) { sql += ` AND cg.branch_id = ?`; params.push(filters.branchId); }
    if (filters.status) { sql += ` AND cg.status = ?`; params.push(filters.status); }
    const [rows] = await db.execute(sql, params);
    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT cg.*, b.branch_name
       FROM customer_groups cg
       INNER JOIN branches b ON b.branch_id = cg.branch_id
       WHERE cg.group_id = ? AND cg.deleted_at IS NULL`,
      [id],
    );
    return rows[0] || null;
  }

  async update(connection, id, data) {
    await connection.execute(
      `UPDATE customer_groups SET group_name=?, branch_id=?, description=?, meeting_day=?, status=?, updated_by=? WHERE group_id=?`,
      [data.groupName, data.branchId, data.description || null, data.meetingDay || null, data.status || "ACTIVE", data.updatedBy, id],
    );
  }

  async delete(connection, id, deletedBy) {
    await connection.execute(
      `UPDATE customer_groups SET deleted_at=NOW(), deleted_by=? WHERE group_id=?`,
      [deletedBy, id],
    );
  }

  // --- Members ---
  async getMembers(groupId) {
    const [rows] = await db.execute(
      `SELECT gm.*, CONCAT(c.first_name, ' ', c.last_name) customer_name, c.mobile_number, c.customer_code
       FROM group_members gm
       INNER JOIN customers c ON c.customer_id = gm.customer_id
       WHERE gm.group_id = ? AND gm.deleted_at IS NULL
       ORDER BY gm.joined_at DESC`,
      [groupId],
    );
    return rows;
  }

  async addMember(connection, data) {
    await connection.execute(
      `INSERT INTO group_members (group_id, customer_id, role, added_by) VALUES (?,?,?,?)`,
      [data.groupId, data.customerId, data.role || "MEMBER", data.addedBy],
    );
  }

  async removeMember(connection, groupId, customerId) {
    await connection.execute(
      `UPDATE group_members SET deleted_at=NOW() WHERE group_id=? AND customer_id=?`,
      [groupId, customerId],
    );
  }

  async isMember(groupId, customerId) {
    const [rows] = await db.execute(
      `SELECT id FROM group_members WHERE group_id=? AND customer_id=? AND deleted_at IS NULL LIMIT 1`,
      [groupId, customerId],
    );
    return rows.length > 0;
  }

  // --- Attendance ---
  async recordAttendance(connection, records) {
    for (const r of records) {
      await connection.execute(
        `INSERT INTO group_attendance (group_id, customer_id, meeting_date, status, remarks, recorded_by) VALUES (?,?,?,?,?,?)`,
        [r.groupId, r.customerId, r.meetingDate, r.status, r.remarks || null, r.recordedBy],
      );
    }
  }

  async getAttendance(groupId, date) {
    const params = [groupId];
    let sql = `SELECT ga.*, CONCAT(c.first_name,' ',c.last_name) customer_name FROM group_attendance ga INNER JOIN customers c ON c.customer_id=ga.customer_id WHERE ga.group_id=?`;
    if (date) { sql += ` AND DATE(ga.meeting_date)=?`; params.push(date); }
    sql += ` ORDER BY ga.meeting_date DESC`;
    const [rows] = await db.query(sql, params);
    return rows;
  }
}

export default new GroupRepository();