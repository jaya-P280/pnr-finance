import pool from "../../database/db.js";

class UserRepository {

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

    async getLastEmployeeCode(connection) {

        const [rows] = await connection.execute(
            `
            SELECT employee_code
            FROM users
            ORDER BY user_id DESC
            LIMIT 1
            `
        );

        return rows[0] || null;
    }

    async emailExists(connection, email) {

        const [rows] = await connection.execute(
            `
            SELECT user_id
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [email]
        );

        return rows.length > 0;
    }

    async phoneExists(connection, phone) {

        const [rows] = await connection.execute(
            `
            SELECT user_id
            FROM users
            WHERE phone = ?
            LIMIT 1
            `,
            [phone]
        );

        return rows.length > 0;
    }

    async roleExists(connection, roleId) {

        const [rows] = await connection.execute(
            `
            SELECT role_id
            FROM roles
            WHERE role_id = ?
            AND is_active = TRUE
            LIMIT 1
            `,
            [roleId]
        );

        return rows[0] || null;
    }

    async branchExists(connection, branchId) {

        const [rows] = await connection.execute(
            `
            SELECT branch_id
            FROM branches
            WHERE branch_id = ?
            AND status = 'ACTIVE'
            LIMIT 1
            `,
            [branchId]
        );

        return rows[0] || null;
    }

    async createUser(connection, user) {
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
                profile_image,
                created_by,
                must_change_password
            )
            VALUES
            (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            `,
            [
                user.branchId,
                user.roleId,
                user.employeeCode,
                user.firstName,
                user.lastName,
                user.email,
                user.phone,
                user.profileImage,
                user.createdBy,
                true
            ]
        );

        return result.insertId;
    }

    async getUsers(filters) {
        const {
            page,
            limit,
            search,
            roleId,
            branchId,
            status,
            sortBy,
            sortOrder
        } = filters;

        const allowedSortColumns = {
            created_at: "u.created_at",
            employee_code: "u.employee_code",
            first_name: "u.first_name"
        };

        const orderDirection = sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";
        const orderColumn = allowedSortColumns[sortBy] || "u.created_at";

        let sql =
            `SELECT
            u.user_id,
            u.employee_code,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            u.profile_image,
            u.status,
            u.created_at,
            r.role_name,
            b.branch_name 
        FROM users u
        INNER JOIN roles r
            ON r.role_id = u.role_id
        LEFT JOIN branches b
            ON u.branch_id = b.branch_id
        WHERE
            u.deleted_at IS NULL `;

        const values = [];

        if (search) {
            sql += `
            AND (
                u.employee_code LIKE ?
                OR u.first_name LIKE ?
                OR u.last_name LIKE ?
                OR u.email LIKE ?
                OR u.phone LIKE ?
            )`;
            const keyword = `${search}%`;
            values.push(
                keyword,
                keyword,
                keyword,
                keyword,
                keyword
            );
        }
        if (roleId) {

            sql += `
            AND u.role_id = ?
        `;

            values.push(roleId);

        }

        if (branchId) {

            sql += `
            AND u.branch_id = ?
        `;

            values.push(branchId);

        }

        if (status) {

            sql += `
            AND u.status = ?
        `;

            values.push(status);

        }

        sql += `
        ORDER BY ${orderColumn} ${orderDirection}

        LIMIT ?

        OFFSET ?
    `;

        values.push(
            limit,
            (page - 1) * limit
        );

        const [rows] = await pool.query(sql, values);

        return rows;
    }

    async countUsers(filters) {

        const {

            search,
            roleId,
            branchId,
            status

        } = filters;

        let sql = `

        SELECT

            COUNT(*) AS total

        FROM users u

        WHERE

            u.deleted_at IS NULL

    `;

        const values = [];

        if (search) {

            sql += `
            AND
            (
                u.employee_code LIKE ?
                OR u.first_name LIKE ?
                OR u.last_name LIKE ?
                OR u.email LIKE ?
                OR u.phone LIKE ?
            )
        `;

            const keyword = `%${search}%`;

            values.push(
                keyword,
                keyword,
                keyword,
                keyword,
                keyword
            );

        }

        if (roleId) {

            sql += `
            AND u.role_id = ?
        `;

            values.push(roleId);

        }

        if (branchId) {

            sql += `
            AND u.branch_id = ?
        `;

            values.push(branchId);

        }

        if (status) {

            sql += `
            AND u.status = ?
        `;

            values.push(status);

        }

        const [rows] = await pool.execute(sql, values);

        return rows[0].total;

    }

    async getUserById(UserId) {
        const [rows] = await pool.execute(`
            SELECT
                u.user_id,
                u.employee_code,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.profile_image,
                u.status,
                u.created_at,
                u.updated_at,
                r.role_id,
                r.role_name,
                b.branch_id,
                b.branch_name
            FROM users u
            INNER JOIN roles r
                ON r.role_id = u.role_id
            LEFT JOIN branches b
                ON b.branch_id = u. branch_id
            WHERE 
                u.user_id = ?
                AND u.deleted_at IS NULL
            LIMIT 1`, [UserId]);

        return rows[0] || null;
    }

    async findUserByEmail(email) {
        const [row] = await pool.query(`
            SELECT 
                user_id
            FROM users
            WHERE email = ?
            AND deleted_at IS NULL
            LIMIT 1`,
            [email]
        )

        return row[0] || null;
    }

    async findUserByPhone(phone) {
        const [row] = await pool.execute(
            `
            SELECT 
                user_id 
            FROM users
            WHERE phone = ?
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [phone]
        );
        return row[0] || null;
    }

    //Update the user

    async updateUser(connection, user) {
        await connection.execute(`
            UPDATE users
            SET
                first_name = ?,
                last_name = ?,
                email = ?,
                phone = ?,
                role_id = ?,
                branch_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE
                user_id = ?
            AND
                deleted_at IS NULL
            `, [
            user.firstName,
            user.lastName,
            user.email,
            user.phone,
            user.roleId,
            user.branchId,
            user.userId
        ]
        );
    }

    async updateUserStatus(connection, userId, status) {
        await connection.execute(
            `
            UPDATE users
            SET 
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                user_id = ?
            AND 
                deleted_at IS NULL
            `, [
            status,
            userId
        ]
        );
    }

    async updatePassword(
        connection,
        userId,
        passwordHash
    ) {

        await connection.execute(

            `
        UPDATE users

        SET

            password_hash = ?,

            must_change_password = FALSE,

            updated_at = CURRENT_TIMESTAMP

        WHERE

            user_id = ?

        AND

            deleted_at IS NULL
        `,

            [

                passwordHash,

                userId

            ]

        );

    }

    async countActiveSuperAdmins(connection) {

        const [rows] = await connection.execute(
            `
        SELECT COUNT(*) AS total

        FROM users

        WHERE

            role_id = (
                SELECT role_id
                FROM roles
                WHERE role_name = 'SUPER_ADMIN'
            )

        AND status = 'ACTIVE'

        AND deleted_at IS NULL
        `
        );

        return rows[0].total;

    }

    async softDeleteUser(
        connection,
        userId,
        deletedBy
    ) {

        await connection.execute(
            `
        UPDATE users

        SET

            status = 'INACTIVE',

            deleted_at = CURRENT_TIMESTAMP,

            deleted_by = ?,

            updated_at = CURRENT_TIMESTAMP

        WHERE

            user_id = ?

        AND

            deleted_at IS NULL
        `,
            [
                deletedBy,
                userId
            ]
        );


    }

    async updateProfileImage(
        connection,
        userId,
        profileImage
    ) {

        await connection.execute(
            `
        UPDATE users
        SET
            profile_image = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            user_id = ?
        AND
            deleted_at IS NULL
        `,
            [
                profileImage,
                userId
            ]
        );

    }

    async getProfileImage(userId) {

        const [rows] = await pool.execute(
            `
        SELECT
            profile_image
        FROM users
        WHERE
            user_id = ?
        AND
            deleted_at IS NULL
        LIMIT 1
        `,
            [userId]
        );

        return rows[0] || null;

    }

}

export default new UserRepository();