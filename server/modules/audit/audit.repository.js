import pool from "../../database/db.js";

class AuditRepository {
  async create(log) {
    const {
      userId,
      roleName,
      branchId,
      customerId,
      action,
      module,
      entityName,
      entityId,
      httpMethod,
      endpoint,
      ipAddress,
      userAgent,
      requestParams,
      requestBody,
      responseStatus,
      responseTimeMs,
      isSuccess,
      errorMessage,
      correlationId,
      description,
    } = log;

    await pool.execute(
      `
      INSERT INTO audit_logs
      (
        user_id,
        role_name,
        branch_id,
        customer_id,
        action,
        module,
        entity_name,
        entity_id,
        http_method,
        endpoint,
        ip_address,
        user_agent,
        request_params,
        request_body,
        response_status,
        response_time_ms,
        is_success,
        error_message,
        correlation_id,
        description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId || null,
        roleName || null,
        branchId || null,
        customerId || null,
        action || "UNKNOWN_ACTION",
        module || "SYSTEM",
        entityName || null,
        entityId || null,
        httpMethod || "GET",
        endpoint || "/",
        ipAddress || null,
        userAgent || null,
        requestParams || null,
        requestBody || null,
        responseStatus || 200,
        responseTimeMs || 0,
        isSuccess !== undefined ? isSuccess : 1,
        errorMessage || null,
        correlationId || null,
        description || null,
      ],
    );
  }

  async findAll(filters = {}) {
    const {
      search,
      userId,
      roleName,
      module: moduleName,
      action,
      branchId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    const offset = (Number(page) - 1) * Number(limit);
    let whereClauses = ["1=1"];
    let params = [];

    if (search) {
      whereClauses.push(
        `(a.action LIKE ? OR a.module LIKE ? OR a.endpoint LIKE ? OR u.email LIKE ? OR u.first_name LIKE ?)`
      );
      const q = `%${search}%`;
      params.push(q, q, q, q, q);
    }

    if (userId) {
      whereClauses.push("a.user_id = ?");
      params.push(userId);
    }

    if (roleName) {
      whereClauses.push("a.role_name = ?");
      params.push(roleName);
    }

    if (moduleName) {
      whereClauses.push("a.module = ?");
      params.push(moduleName);
    }

    if (action) {
      whereClauses.push("a.action = ?");
      params.push(action);
    }

    if (branchId) {
      whereClauses.push("a.branch_id = ?");
      params.push(branchId);
    }

    if (status !== undefined && status !== "") {
      whereClauses.push("a.is_success = ?");
      params.push(status === "success" || status === "1" ? 1 : 0);
    }

    if (startDate) {
      whereClauses.push("a.created_at >= ?");
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      whereClauses.push("a.created_at <= ?");
      params.push(`${endDate} 23:59:59`);
    }

    const whereSql = whereClauses.join(" AND ");

    const [countRows] = await pool.execute(
      `
      SELECT COUNT(*) as total
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.user_id
      WHERE ${whereSql}
      `,
      params
    );

    const total = countRows[0]?.total || 0;

    const [rows] = await pool.execute(
      `
      SELECT
        a.*,
        u.first_name,
        u.last_name,
        u.email,
        u.employee_code,
        b.branch_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN branches b ON a.branch_id = b.branch_id
      WHERE ${whereSql}
      ORDER BY a.log_id DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
      `,
      params
    );

    return {
      logs: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  async getStats() {
    const [totalLogs] = await pool.execute(`SELECT COUNT(*) as count FROM audit_logs`);
    const [failedLogs] = await pool.execute(`SELECT COUNT(*) as count FROM audit_logs WHERE is_success = 0`);
    const [todayLogs] = await pool.execute(`SELECT COUNT(*) as count FROM audit_logs WHERE DATE(created_at) = CURRENT_DATE()`);
    const [modules] = await pool.execute(`SELECT COUNT(DISTINCT module) as count FROM audit_logs`);

    return {
      totalLogs: totalLogs[0]?.count || 0,
      failedLogs: failedLogs[0]?.count || 0,
      todayLogs: todayLogs[0]?.count || 0,
      activeModules: modules[0]?.count || 0,
    };
  }
}

export default new AuditRepository();
