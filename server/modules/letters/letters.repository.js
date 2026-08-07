import pool from "../../database/db.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";

class LettersRepository {
  async createLetter(data) {
    const [last] = await pool.execute(`SELECT letter_number FROM letters ORDER BY letter_id DESC LIMIT 1`);
    const letterNumber = CodeGenerator.generate("LTR", last[0]?.letter_number, 5);

    const [res] = await pool.execute(
      `INSERT INTO letters (
        letter_number, letter_type, recipient_name, recipient_designation,
        organization, subject, body, issued_date, signatory_name, signatory_title, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        letterNumber,
        (data.letterType || data.type || "OFFICIAL").toUpperCase(),
        data.recipientName || "RECIPIENT",
        data.recipientDesignation || "",
        data.organization || data.companyName || "",
        data.subject || data.salutation || data.letterType || "OFFICIAL LETTER",
        data.body || data.bodyText || "",
        data.issuedDate || data.date || new Date().toISOString().split("T")[0],
        data.signatoryName || data.signatory || "AUTHORIZED SIGNATORY",
        data.signatoryTitle || "",
        data.createdBy
      ]
    );
    return { letterId: res.insertId, letterNumber };
  }

  async getLetters(userId) {
    let sql = `
      SELECT l.*, u.first_name as creator_first, u.last_name as creator_last
      FROM letters l
      LEFT JOIN users u ON u.user_id = l.created_by
      ORDER BY l.created_at DESC
    `;
    const [rows] = await pool.execute(sql);
    return rows;
  }
}

export default new LettersRepository();
