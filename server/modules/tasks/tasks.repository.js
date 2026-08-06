import pool from "../../database/db.js";

class TaskRepository {
  async getAllTasks(filters = {}) {
    let sql = `
      SELECT 
        t.task_id,
        t.task_title,
        t.description,
        t.category,
        t.priority,
        t.status,
        t.due_date,
        t.assigned_to,
        t.branch_id,
        t.customer_id,
        t.created_by,
        t.created_at,
        t.updated_at,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS assigned_to_name,
        b.branch_name,
        CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name,
        c.customer_code
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.user_id
      LEFT JOIN branches b ON t.branch_id = b.branch_id
      LEFT JOIN customers c ON t.customer_id = c.customer_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status && filters.status !== "ALL") {
      sql += ` AND t.status = ?`;
      params.push(filters.status);
    }
    if (filters.priority && filters.priority !== "ALL") {
      sql += ` AND t.priority = ?`;
      params.push(filters.priority);
    }
    if (filters.category && filters.category !== "ALL") {
      sql += ` AND t.category = ?`;
      params.push(filters.category);
    }
    if (filters.assignedTo) {
      sql += ` AND t.assigned_to = ?`;
      params.push(filters.assignedTo);
    }
    if (filters.branchId) {
      sql += ` AND t.branch_id = ?`;
      params.push(filters.branchId);
    }
    if (filters.search) {
      sql += ` AND (t.task_title LIKE ? OR t.description LIKE ? OR c.first_name LIKE ? OR c.customer_code LIKE ?)`;
      const s = `%${filters.search}%`;
      params.push(s, s, s, s);
    }

    sql += ` ORDER BY t.created_at DESC`;

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async getTaskById(taskId) {
    const sql = `
      SELECT 
        t.*,
        CONCAT(u.first_name, ' ', COALESCE(u.last_name, '')) AS assigned_to_name,
        b.branch_name,
        CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.user_id
      LEFT JOIN branches b ON t.branch_id = b.branch_id
      LEFT JOIN customers c ON t.customer_id = c.customer_id
      WHERE t.task_id = ?
    `;
    const [rows] = await pool.execute(sql, [taskId]);
    return rows[0] || null;
  }

  async createTask(taskData) {
    const {
      task_title,
      description,
      category = "FIELD_VISIT",
      priority = "MEDIUM",
      status = "PENDING",
      due_date,
      assigned_to,
      branch_id,
      customer_id,
      created_by,
    } = taskData;

    const sql = `
      INSERT INTO tasks (
        task_title, description, category, priority, status,
        due_date, assigned_to, branch_id, customer_id, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      task_title,
      description || null,
      category,
      priority,
      status,
      due_date || null,
      assigned_to || null,
      branch_id || null,
      customer_id || null,
      created_by || null,
    ]);

    return this.getTaskById(result.insertId);
  }

  async updateTask(taskId, taskData) {
    const fields = [];
    const params = [];

    const allowed = [
      "task_title",
      "description",
      "category",
      "priority",
      "status",
      "due_date",
      "assigned_to",
      "branch_id",
      "customer_id",
    ];

    for (const key of allowed) {
      if (taskData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(taskData[key]);
      }
    }

    if (fields.length === 0) return this.getTaskById(taskId);

    params.push(taskId);
    const sql = `UPDATE tasks SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE task_id = ?`;
    await pool.execute(sql, params);

    return this.getTaskById(taskId);
  }

  async updateTaskStatus(taskId, status) {
    const sql = `UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE task_id = ?`;
    await pool.execute(sql, [status, taskId]);
    return this.getTaskById(taskId);
  }

  async deleteTask(taskId) {
    const sql = `DELETE FROM tasks WHERE task_id = ?`;
    const [result] = await pool.execute(sql, [taskId]);
    return result.affectedRows > 0;
  }

  async getTaskStats(branchId = null) {
    let sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN priority = 'URGENT' AND status != 'COMPLETED' THEN 1 ELSE 0 END) as urgent
      FROM tasks
      WHERE 1=1
    `;
    const params = [];
    if (branchId) {
      sql += ` AND branch_id = ?`;
      params.push(branchId);
    }
    const [rows] = await pool.execute(sql, params);
    return rows[0] || { total: 0, pending: 0, in_progress: 0, completed: 0, urgent: 0 };
  }
}

export default new TaskRepository();
