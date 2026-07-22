import db from "../../database/db.js";

class LoanProductRepository {
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

  async getLastProductCode() {
    const [rows] = await db.execute(`
      SELECT product_code
      FROM loan_products
      ORDER BY loan_product_id DESC
      LIMIT 1
    `);

    return rows[0] || null;
  }

  async existsByName(connection, productName) {
    const [rows] = await connection.execute(
      `
      SELECT loan_product_id
      FROM loan_products
      WHERE product_name = ?
      AND deleted_at IS NULL
      LIMIT 1
      `,
      [productName],
    );

    return rows.length > 0;
  }

  async create(connection, product) {
    const [result] = await connection.execute(
      `
  INSERT INTO loan_products
  (
    product_code,
    product_name,
    product_type,
    interest_type,
    recovery_frequency,
    minimum_amount,
    maximum_amount,
    minimum_tenure,
    maximum_tenure,
    interest_rate,
    processing_fee_type,
    processing_fee,
    insurance_fee_type,
    insurance_fee,
    penalty_type,
    penalty,
    holiday_excluded,
    include_gst,
    description,
    created_by
  )
  VALUES
  (
    ?,?,?,?,?,?,
    ?,?,?,?,?,?,
    ?,?,?,?,?,?,
    ?,?
  )
  `,
      [
        product.productCode,
        product.productName,
        product.productType,
        product.interestType,
        product.recoveryFrequency,
        product.minimumAmount,
        product.maximumAmount,
        product.minimumTenure,
        product.maximumTenure,
        product.interestRate,
        product.processingFeeType,
        product.processingFee,
        product.insuranceFeeType,
        product.insuranceFee,
        product.penaltyType,
        product.penalty,
        product.holidayExcluded,
        product.includeGst,
        product.description,
        product.createdBy,
      ],
    );

    return result.insertId;
  }

  async findAll(filters) {
    const params = [];

    let sql = `
      SELECT
        loan_product_id,
        product_code,
        product_name,
        product_type,
        interest_type,
        recovery_frequency,
        minimum_amount,
        maximum_amount,
        interest_rate,
        status,
        created_at
      FROM loan_products
      WHERE deleted_at IS NULL
    `;

    if (filters.search) {
      sql += `
      AND (
        product_name LIKE ?
        OR product_code LIKE ?
      )
      `;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.status) {
      sql += ` AND status=?`;
      params.push(filters.status);
    }

    sql += `
      ORDER BY ${filters.sortBy} ${filters.sortOrder}
      LIMIT ?
      OFFSET ?
    `;

    params.push(filters.limit);
    params.push((filters.page - 1) * filters.limit);

    const [rows] = await db.query(sql, params);

    return rows;
  }

  async count(filters) {
    const params = [];

    let sql = `
      SELECT COUNT(*) total
      FROM loan_products
      WHERE deleted_at IS NULL
    `;

    if (filters.search) {
      sql += `
      AND (
        product_name LIKE ?
        OR product_code LIKE ?
      )
      `;

      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.status) {
      sql += ` AND status=?`;
      params.push(filters.status);
    }

    const [rows] = await db.execute(sql, params);

    return rows[0].total;
  }

  async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT *
      FROM loan_products
      WHERE loan_product_id=?
      AND deleted_at IS NULL
      `,
      [id],
    );

    return rows[0] || null;
  }

  async update(connection, product) {
    await connection.execute(
      `
      UPDATE loan_products
      SET
        product_name=?,
        product_type=?,
        interest_type=?,
        recovery_frequency=?,
        minimum_amount=?,
        maximum_amount=?,
        minimum_tenure=?,
        maximum_tenure=?,
        interest_rate=?,
        processing_fee_type=?,
        processing_fee=?,
        insurance_fee_type=?,
        insurance_fee=?,
        penalty_type=?,
        penalty=?,
        holiday_excluded=?,
        include_gst=?,
        description=?,
        updated_by=?
      WHERE loan_product_id=?
      `,
      [
        product.productName,
        product.productType,
        product.interestType,
        product.recoveryFrequency,
        product.minimumAmount,
        product.maximumAmount,
        product.minimumTenure,
        product.maximumTenure,
        product.interestRate,
        product.processingFeeType,
        product.processingFee,
        product.insuranceFeeType,
        product.insuranceFee,
        product.penaltyType,
        product.penalty,
        product.holidayExcluded,
        product.includeGst,
        product.description,
        product.updatedBy,
        product.loanProductId,
      ],
    );
  }

  async updateStatus(connection, id, status, updatedBy) {
    await connection.execute(
      `
      UPDATE loan_products
      SET
        status=?,
        updated_by=?
      WHERE loan_product_id=?
      `,
      [status, updatedBy, id],
    );
  }

  async softDelete(connection, id, updatedBy) {
    await connection.execute(
      `
      UPDATE loan_products
      SET
        deleted_at=NOW(),
        updated_by=?
      WHERE loan_product_id=?
      `,
      [updatedBy, id],
    );
  }
}

export default new LoanProductRepository();
