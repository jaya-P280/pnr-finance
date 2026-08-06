import db from "../../database/db.js";

class PermissionRepository {

  async findAll(filters) {

    const params = [];

    let sql = `
      SELECT
        permission_id,
        permission_name,
        module_name,
        description
      FROM permission
      WHERE 1 = 1
    `;

    if (filters.search) {
      sql += `
        AND (
          permission_name LIKE ?
          OR module_name LIKE ?
          OR description LIKE ?
        )
      `;

      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`,
        `%${filters.search}%`
      );
    }

    if (filters.moduleName) {
      sql += `
        AND module_name = ?
      `;

      params.push(filters.moduleName);
    }

    sql += `
      ORDER BY
        module_name,
        permission_name
    `;

    const [rows] = await db.execute(
      sql,
      params
    );

    return rows;

  }

  async findById(permissionId) {

    const [rows] = await db.execute(
      `
      SELECT
        permission_id,
        permission_name,
        module_name,
        description
      FROM permission
      WHERE permission_id = ?
      `,
      [
        permissionId
      ]
    );

    return rows[0] || null;

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

  async getModules() {

    const [rows] = await db.execute(
      `
      SELECT DISTINCT
        module_name
      FROM permission
      ORDER BY module_name
      `
    );

    return rows;

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

    const grouped = {};

    rows.forEach(permission => {

      if (!grouped[permission.module_name]) {

        grouped[permission.module_name] = [];

      }

      grouped[
        permission.module_name
      ].push(permission);

    });

    return Object.keys(grouped).map(
      moduleName => ({
        moduleName,
        permissions:
          grouped[moduleName]
      })
    );

  }

}

export default new PermissionRepository();