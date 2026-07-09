import pool from "../db.js";

class InitializeRepository {

    async beginTransaction() {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        return connection;
    }

    async commit(connection) {
        await connection.commit();
        connection.release();
    }

    async rollback(connection) {
        await connection.rollback();
        connection.release();
    }

    /* ===========================
       ROLES
    ============================ */

    async findRoleByName(connection, roleName) {

        const [rows] = await connection.execute(
            `
            SELECT role_id
            FROM roles
            WHERE role_name = ?
            LIMIT 1
            `,
            [roleName]
        );

        return rows[0];
    }

    async createRole(connection, role) {

        const [result] = await connection.execute(
            `
            INSERT INTO roles
            (
                role_name,
                role_description
            )
            VALUES (?, ?)
            `,
            [
                role.role_name,
                role.role_description
            ]
        );

        return result.insertId;
    }

    /* ===========================
       PERMISSIONS
    ============================ */

    async findPermissionByName(connection, permissionName) {

        const [rows] = await connection.execute(
            `
            SELECT permission_id
            FROM permission
            WHERE permission_name = ?
            LIMIT 1
            `,
            [permissionName]
        );

        return rows[0];
    }

    async createPermission(connection, permission) {

        const [result] = await connection.execute(
            `
            INSERT INTO permission
            (
                permission_name,
                module_name,
                description
            )
            VALUES (?, ?, ?)
            `,
            [
                permission.permission_name,
                permission.module_name,
                permission.description
            ]
        );

        return result.insertId;
    }

    /* ===========================
       ROLE PERMISSIONS
    ============================ */

    async rolePermissionExists(connection, roleId, permissionId) {

        const [rows] = await connection.execute(
            `
            SELECT role_permission_id
            FROM role_permissions
            WHERE role_id = ?
            AND permission_id = ?
            LIMIT 1
            `,
            [
                roleId,
                permissionId
            ]
        );

        return rows[0];
    }

    async assignPermission(connection, roleId, permissionId) {

        await connection.execute(
            `
            INSERT INTO role_permissions
            (
                role_id,
                permission_id
            )
            VALUES (?, ?)
            `,
            [
                roleId,
                permissionId
            ]
        );
    }

    /* ===========================
       BRANCH
    ============================ */

    async findBranch(connection, branchCode) {

        const [rows] = await connection.execute(
            `
            SELECT branch_id
            FROM branches
            WHERE branch_code = ?
            LIMIT 1
            `,
            [branchCode]
        );

        return rows[0];
    }

    async createBranch(connection, branch) {

        const [result] = await connection.execute(
            `
            INSERT INTO branches
            (
                branch_code,
                branch_name,
                phone,
                email,
                address,
                city,
                state,
                pincode
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                branch.branch_code,
                branch.branch_name,
                branch.phone,
                branch.email,
                branch.address,
                branch.city,
                branch.state,
                branch.pincode
            ]
        );

        return result.insertId;
    }

    /* ===========================
       USERS
    ============================ */

    async findAdmin(connection, email) {

        const [rows] = await connection.execute(
            `
            SELECT user_id
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [email]
        );

        return rows[0];
    }

    async createAdmin(connection, admin) {

        const [result] = await connection.execute(
            `
            INSERT INTO users
            (
                branch_id,
                role_id,
                employee_code,
                first_name,
                last_name,
                email,
                phone,
                password_hash
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                admin.branch_id,
                admin.role_id,
                admin.employee_code,
                admin.first_name,
                admin.last_name,
                admin.email,
                admin.phone,
                admin.password_hash
            ]
        );

        return result.insertId;
    }

}

export default new InitializeRepository();