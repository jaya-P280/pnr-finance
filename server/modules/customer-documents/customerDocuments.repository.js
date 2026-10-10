import pool from "../../database/db.js";

class CustomerDocumentsRepository {
  async getDocumentsList(params = {}) {
    let sql = `
      SELECT
        cd.document_id AS id,
        cd.document_id AS documentId,
        cd.customer_id AS customerId,
        cd.application_id AS applicationId,
        cd.document_type_id AS documentTypeId,
        cd.document_type_code AS documentTypeCode,
        cd.document_type_code AS document_type_code,
        cd.document_title AS documentTitle,
        cd.file_url AS fileUrl,
        cd.file_url AS file_url,
        cd.file_name AS fileName,
        cd.file_name AS file_name,
        cd.file_name AS original_name,
        cd.file_size AS fileSize,
        cd.mime_type AS mimeType,
        cd.mime_type AS mime_type,
        cd.status,
        cd.status AS verification_status,
        cd.verified_by AS verifiedBy,
        cd.verified_at AS verifiedAt,
        cd.rejection_reason AS rejectionReason,
        cd.rejection_reason AS rejection_reason,
        cd.uploaded_at AS uploadedAt,
        cd.uploaded_at AS created_at,
        c.customer_code AS customerCode,
        c.customer_code AS customer_code,
        c.first_name AS customerFirstName,
        c.first_name AS first_name,
        c.last_name AS customerLastName,
        c.last_name AS last_name,
        c.mobile_number AS customerMobile,
        c.mobile_number AS mobile_number,
        c.branch_id AS branchId,
        b.branch_name AS branchName,
        dt.title AS slotTitle,
        dt.title AS document_type_title,
        dt.title AS type_name,
        dt.category AS slotCategory,
        dt.category AS type_category,
        dt.is_required_for_loan AS isRequiredForLoan,
        la.application_number AS applicationNumber,
        la.application_number AS application_number,
        la.approved_amount AS approvedAmount,
        u.first_name AS verifierFirstName,
        u.last_name AS verifierLastName
      FROM customer_documents cd
      INNER JOIN customers c ON c.customer_id = cd.customer_id
      LEFT JOIN branches b ON b.branch_id = c.branch_id
      INNER JOIN document_types dt ON dt.id = cd.document_type_id
      LEFT JOIN loan_applications la ON la.application_id = cd.application_id
      LEFT JOIN users u ON u.user_id = cd.verified_by
      WHERE 1=1
    `;
    const queryParams = [];

    if (params.status && params.status !== "ALL") {
      sql += ` AND cd.status = ?`;
      queryParams.push(params.status);
    }
    if (params.branchId) {
      sql += ` AND c.branch_id = ?`;
      queryParams.push(params.branchId);
    }
    if (params.customerId) {
      sql += ` AND cd.customer_id = ?`;
      queryParams.push(params.customerId);
    }
    if (params.applicationId) {
      sql += ` AND cd.application_id = ?`;
      queryParams.push(params.applicationId);
    }
    if (params.search) {
      sql += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.customer_code LIKE ? OR c.mobile_number LIKE ? OR cd.document_title LIKE ? OR la.application_number LIKE ?)`;
      const term = `%${params.search}%`;
      queryParams.push(term, term, term, term, term, term);
    }

    sql += ` ORDER BY cd.uploaded_at DESC`;

    const [rows] = await pool.execute(sql, queryParams);
    return rows;
  }

  async getDocumentsByApplicationId(applicationId) {
    const [rows] = await pool.execute(
      `SELECT
        cd.document_id AS id,
        cd.document_id AS documentId,
        cd.customer_id AS customerId,
        cd.application_id AS applicationId,
        cd.document_type_id AS documentTypeId,
        cd.document_type_code AS documentTypeCode,
        cd.document_type_code AS document_type_code,
        cd.document_title AS documentTitle,
        cd.file_url AS fileUrl,
        cd.file_url AS file_url,
        cd.file_name AS fileName,
        cd.file_name AS file_name,
        cd.file_name AS original_name,
        cd.file_size AS fileSize,
        cd.mime_type AS mimeType,
        cd.mime_type AS mime_type,
        cd.status,
        cd.status AS verification_status,
        cd.verified_by AS verifiedBy,
        cd.verified_at AS verifiedAt,
        cd.rejection_reason AS rejectionReason,
        cd.rejection_reason AS rejection_reason,
        cd.uploaded_at AS uploadedAt,
        cd.uploaded_at AS created_at,
        dt.title AS slotTitle,
        dt.title AS document_type_title,
        dt.title AS type_name,
        dt.category AS slotCategory,
        dt.category AS type_category,
        dt.is_required_for_loan AS isRequiredForLoan,
        u.first_name AS verifierFirstName,
        u.last_name AS verifierLastName
      FROM customer_documents cd
      INNER JOIN document_types dt ON dt.id = cd.document_type_id
      LEFT JOIN users u ON u.user_id = cd.verified_by
      WHERE cd.application_id = ?
      ORDER BY cd.uploaded_at DESC`,
      [applicationId]
    );
    return rows;
  }

  async getDocumentsByCustomerId(customerId) {
    const [rows] = await pool.execute(
      `SELECT
        cd.document_id AS id,
        cd.document_id AS documentId,
        cd.customer_id AS customerId,
        cd.application_id AS applicationId,
        cd.document_type_id AS documentTypeId,
        cd.document_type_code AS documentTypeCode,
        cd.document_type_code AS document_type_code,
        cd.document_title AS documentTitle,
        cd.file_url AS fileUrl,
        cd.file_url AS file_url,
        cd.file_name AS fileName,
        cd.file_name AS file_name,
        cd.file_name AS original_name,
        cd.file_size AS fileSize,
        cd.mime_type AS mimeType,
        cd.mime_type AS mime_type,
        cd.status,
        cd.status AS verification_status,
        cd.verified_by AS verifiedBy,
        cd.verified_at AS verifiedAt,
        cd.rejection_reason AS rejectionReason,
        cd.rejection_reason AS rejection_reason,
        cd.uploaded_at AS uploadedAt,
        cd.uploaded_at AS created_at,
        dt.title AS slotTitle,
        dt.title AS document_type_title,
        dt.title AS type_name,
        dt.category AS slotCategory,
        dt.category AS type_category,
        dt.is_required_for_loan AS isRequiredForLoan,
        la.application_number AS applicationNumber,
        la.application_number AS application_number
      FROM customer_documents cd
      INNER JOIN document_types dt ON dt.id = cd.document_type_id
      LEFT JOIN loan_applications la ON la.application_id = cd.application_id
      WHERE cd.customer_id = ?
      ORDER BY cd.uploaded_at DESC`,
      [customerId]
    );
    return rows;
  }

  async findById(documentId) {
    const [rows] = await pool.execute(
      `SELECT * FROM customer_documents WHERE document_id = ?`,
      [documentId]
    );
    return rows[0] || null;
  }

  async verifyDocument(documentId, verifierUserId) {
    await pool.execute(
      `UPDATE customer_documents
       SET status = 'VERIFIED',
           verified_by = ?,
           verified_at = CURRENT_TIMESTAMP,
           rejection_reason = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE document_id = ?`,
      [verifierUserId, documentId]
    );
    return this.findById(documentId);
  }

  async rejectDocument(documentId, reason, verifierUserId) {
    await pool.execute(
      `UPDATE customer_documents
       SET status = 'REJECTED',
           verified_by = ?,
           verified_at = CURRENT_TIMESTAMP,
           rejection_reason = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE document_id = ?`,
      [verifierUserId, reason, documentId]
    );
    return this.findById(documentId);
  }
}

export default new CustomerDocumentsRepository();
