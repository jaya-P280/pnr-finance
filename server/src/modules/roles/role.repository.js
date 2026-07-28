import db from "../../database/db.js";

class RoleRepository {

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

  async findAll(filters) {

    const params = [];

    let sql = `
      SELECT
        r.role_id,
        r.role_name,
        r.role_description,
        r.is_active,
        r.created_at,
        COUNT(rp.permission_id) AS permission_count
      FROM roles r
      LEFT JOIN role_permissions rp
        ON rp.role_id = r.role_id
      WHERE 1 = 1
    `;

    if (filters.search) {
      sql += `
        AND (
          r.role_name LIKE ?
          OR r.role_description LIKE ?
        )
      `;

      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`
      );
    }

    if (filters.status !== null && filters.status !== undefined) {
      sql += ` AND r.is_active = ?`;
      params.push(filters.status);
    }

    sql += `
      GROUP BY
        r.role_id
      ORDER BY
        ${filters.sortBy} ${filters.sortOrder}
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
      FROM roles
      WHERE 1 = 1
    `;

    if (filters.search) {
      sql += `
        AND (
          role_name LIKE ?
          OR role_description LIKE ?
        )
      `;

      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`
      );
    }

    if (filters.status !== null && filters.status !== undefined) {
      sql += ` AND is_active = ?`;
      params.push(filters.status);
    }

    const [rows] = await db.execute(sql, params);

    return rows[0].total;
  }

  async findById(id) {

    const [rows] = await db.execute(
      `
      SELECT
        role_id,
        role_name,
        role_description,
        is_active,
        created_at,
        updated_at
      FROM roles
      WHERE role_id = ?
      `,
      [id]
    );

    return rows[0] || null;
  }

  async existsByName(connection, roleName) {

    const [rows] = await connection.execute(
      `
      SELECT
        role_id
      FROM roles
      WHERE LOWER(role_name)=LOWER(?)
      LIMIT 1
      `,
      [roleName]
    );

    return rows.length > 0;
  }

  async create(connection, role) {

    const [result] = await connection.execute(
      `
      INSERT INTO roles
      (
        role_name,
        role_description,
        is_active
      )
      VALUES
      (
        ?,?,?
      )
      `,
      [
        role.roleName,
        role.roleDescription,
        role.isActive,
      ]
    );

    return result.insertId;
  }
    async update(connection, role) {

    await connection.execute(
      `
      UPDATE roles
      SET
        role_name = ?,
        role_description = ?,
        is_active = ?
      WHERE role_id = ?
      `,
      [
        role.roleName,
        role.roleDescription,
        role.isActive,
        role.roleId
      ]
    );

  }

  async updateStatus(
    connection,
    roleId,
    isActive
  ) {

    await connection.execute(
      `
      UPDATE roles
      SET
        is_active = ?
      WHERE role_id = ?
      `,
      [
        isActive,
        roleId
      ]
    );

  }

  async delete(
    connection,
    roleId
  ) {

    await connection.execute(
      `
      DELETE FROM role_permissions
      WHERE role_id = ?
      `,
      [
        roleId
      ]
    );

    await connection.execute(
      `
      DELETE FROM roles
      WHERE role_id = ?
      `,
      [
        roleId
      ]
    );

  }

  async getRolePermissions(roleId) {

    const [rows] = await db.execute(
      `
      SELECT
        p.permission_id,
        p.permission_name,
        p.module_name,
        p.description
      FROM role_permissions rp
      INNER JOIN permission p
        ON rp.permission_id = p.permission_id
      WHERE rp.role_id = ?
      ORDER BY
        p.module_name,
        p.permission_name
      `,
      [
        roleId
      ]
    );

    return rows;

  }

  async replaceRolePermissions(
    connection,
    roleId,
    permissionIds
  ) {

    await connection.execute(
      `
      DELETE FROM role_permissions
      WHERE role_id = ?
      `,
      [
        roleId
      ]
    );

    if (!permissionIds.length) {
      return;
    }

    const values = permissionIds.map(() => "(?, ?)").join(",");

    const params = [];

    permissionIds.forEach(permissionId => {
      params.push(roleId);
      params.push(permissionId);
    });

    await connection.query(
      `
      INSERT INTO role_permissions
      (
        role_id,
        permission_id
      )
      VALUES
      ${values}
      `,
      params
    );

  }

  async permissionExists(permissionId) {

    const [rows] = await db.execute(
      `
      SELECT permission_id
      FROM permission
      WHERE permission_id = ?
      LIMIT 1
      `,
      [
        permissionId
      ]
    );

    return rows.length > 0;

  }

  async getPermissionIds() {

    const [rows] = await db.execute(
      `
      SELECT permission_id
      FROM permission
      `
    );

    return rows.map(
      permission => permission.permission_id
    );

  }

  async isProtectedRole(roleId) {

    const [rows] = await db.execute(
      `
      SELECT
        role_name
      FROM roles
      WHERE role_id = ?
      LIMIT 1
      `,
      [
        roleId
      ]
    );

    if (!rows.length) {
      return false;
    }

    const protectedRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "BRANCH_MANAGER",
      "FIELD_OFFICER",
      "ACCOUNTANT",
      "AUDITOR"
    ];

    return protectedRoles.includes(
      rows[0].role_name.toUpperCase()
    );

  }

  async getPermissionsGrouped() {

    const [rows] = await db.execute(
      `
      SELECT
        permission_id,
        permission_name,
        module_name,
        description
      FROM permission
      ORDER BY
        module_name,
        permission_name
      `
    );

    return rows;

  }
  async getPermissionTree(roleId) {

  const [rows] = await db.execute(
    `
    SELECT
      p.permission_id,
      p.permission_name,
      p.module_name,
      p.description,

      CASE
        WHEN rp.permission_id IS NULL THEN FALSE
        ELSE TRUE
      END AS selected

    FROM permission p

    LEFT JOIN role_permissions rp
      ON rp.permission_id = p.permission_id
      AND rp.role_id = ?

    ORDER BY
      p.module_name,
      p.permission_name
    `,
    [
      roleId
    ]
  );

  return rows;

}
}

export default new RoleRepository();