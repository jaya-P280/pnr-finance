import pool from "../../database/db.js";

class DocumentSlotsRepository {
  async getAll(includeInactive = false) {
    const sql = includeInactive
      ? `SELECT * FROM document_types ORDER BY is_system DESC, id ASC`
      : `SELECT * FROM document_types WHERE status = 'ACTIVE' ORDER BY is_system DESC, id ASC`;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM document_types WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async getByCode(code) {
    const [rows] = await pool.execute(
      `SELECT * FROM document_types WHERE UPPER(code) = UPPER(?) LIMIT 1`,
      [code]
    );
    return rows[0] || null;
  }

  async create(data, userId) {
    const [result] = await pool.execute(
      `INSERT INTO document_types (code, title, category, description, is_required_for_loan, is_system, status, created_by)
       VALUES (?, ?, ?, ?, ?, 0, 'ACTIVE', ?)`,
      [
        data.code.toUpperCase().trim(),
        data.title.trim(),
        data.category ? data.category.toUpperCase().trim() : "GENERAL",
        data.description || null,
        data.isRequiredForLoan ? 1 : 0,
        userId || null,
      ]
    );
    return this.getById(result.insertId);
  }

  async update(id, data) {
    const updates = [];
    const params = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      params.push(data.title.trim());
    }
    if (data.category !== undefined) {
      updates.push("category = ?");
      params.push(data.category.toUpperCase().trim());
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      params.push(data.description || null);
    }
    if (data.isRequiredForLoan !== undefined) {
      updates.push("is_required_for_loan = ?");
      params.push(data.isRequiredForLoan ? 1 : 0);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      params.push(data.status);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.execute(
        `UPDATE document_types SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        params
      );
    }

    return this.getById(id);
  }

  async delete(id) {
    await pool.execute(
      `UPDATE document_types SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND is_system = 0`,
      [id]
    );
    return true;
  }
}

export default new DocumentSlotsRepository();
