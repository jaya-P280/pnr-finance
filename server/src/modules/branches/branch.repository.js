import pool from "../../database/db.js";

class BranchRepository {

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

    async existsByCode(connection, branchCode) {

        const [rows] = await connection.execute(
            `
            SELECT branch_id
            FROM branches
            WHERE branch_code = ?
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [branchCode]
        );

        return rows[0] || null;

    }

    async existsByEmail(connection, email) {

        const [rows] = await connection.execute(
            `
            SELECT branch_id
            FROM branches
            WHERE email = ?
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [email]
        );

        return rows[0] || null;

    }

    async existsByPhone(connection, phone) {

        const [rows] = await connection.execute(
            `
            SELECT branch_id
            FROM branches
            WHERE phone = ?
            AND deleted_at IS NULL
            LIMIT 1
            `,
            [phone]
        );

        return rows[0] || null;

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
                pincode,
                status,
                created_by
            )
            VALUES
            (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            `,
            [
                branch.branchCode,
                branch.branchName,
                branch.phone,
                branch.email,
                branch.address,
                branch.city,
                branch.state,
                branch.pincode,
                "ACTIVE",
                branch.createdBy
            ]
        );

        return result.insertId;

    }

    async getLastBranchCode() {

        const [rows] = await pool.execute(
            `
            SELECT branch_code
            FROM branches
            ORDER BY branch_id DESC
            LIMIT 1
            `
        );

        return rows[0] || null;

    }

    async getBranches(filters) {

        const {
            page,
            limit,
            search,
            status,
            sortBy,
            sortOrder
        } = filters;

        const allowedSortColumns = {
            created_at: "created_at",
            branch_code: "branch_code",
            branch_name: "branch_name"
        };

        const orderColumn =
            allowedSortColumns[sortBy] || "created_at";

        const orderDirection =
            sortOrder?.toUpperCase() === "ASC"
                ? "ASC"
                : "DESC";

        let sql = `
        SELECT
            branch_id,
            branch_code,
            branch_name,
            phone,
            email,
            address,
            city,
            state,
            pincode,
            status,
            created_at
        FROM branches
        WHERE
            deleted_at IS NULL
    `;

        const values = [];

        if (search) {

            sql += `
            AND (
                branch_code LIKE ?
                OR branch_name LIKE ?
                OR city LIKE ?
                OR state LIKE ?
            )
        `;

            const keyword = `%${search}%`;

            values.push(
                keyword,
                keyword,
                keyword,
                keyword
            );

        }

        if (status) {

            sql += `
            AND status = ?
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

        const [rows] =
            await pool.query(sql, values);

        return rows;

    }

    async countBranches(filters) {

        const {
            search,
            status
        } = filters;

        let sql = `
        SELECT
            COUNT(*) AS total
        FROM branches
        WHERE
            deleted_at IS NULL
    `;

        const values = [];

        if (search) {

            sql += `
            AND (
                branch_code LIKE ?
                OR branch_name LIKE ?
                OR city LIKE ?
                OR state LIKE ?
            )
        `;

            const keyword = `%${search}%`;

            values.push(
                keyword,
                keyword,
                keyword,
                keyword
            );

        }

        if (status) {

            sql += `
            AND status = ?
        `;

            values.push(status);

        }

        const [rows] =
            await pool.execute(sql, values);

        return rows[0].total;

    }

    async getBranchById(branchId) {

        const [rows] =
            await pool.execute(
                `
            SELECT
                branch_id,
                branch_code,
                branch_name,
                phone,
                email,
                address,
                city,
                state,
                pincode,
                status,
                created_at,
                updated_at
            FROM branches
            WHERE
                branch_id = ?
            AND
                deleted_at IS NULL
            LIMIT 1
            `,
                [branchId]
            );

        return rows[0] || null;

    }

    async findByEmail(email) {

        const [rows] = await pool.execute(
            `
        SELECT
            branch_id
        FROM branches
        WHERE
            email = ?
        AND
            deleted_at IS NULL
        LIMIT 1
        `,
            [email]
        );

        return rows[0] || null;

    }

    async findByPhone(phone) {

        const [rows] = await pool.execute(
            `
        SELECT
            branch_id
        FROM branches
        WHERE
            phone = ?
        AND
            deleted_at IS NULL
        LIMIT 1
        `,
            [phone]
        );

        return rows[0] || null;

    }

    async updateBranch(connection, branch) {

        await connection.execute(
            `
        UPDATE branches
        SET
            branch_name = ?,
            phone = ?,
            email = ?,
            address = ?,
            city = ?,
            state = ?,
            pincode = ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            branch_id = ?
        AND
            deleted_at IS NULL
        `,
            [
                branch.branchName,
                branch.phone,
                branch.email,
                branch.address,
                branch.city,
                branch.state,
                branch.pincode,
                branch.updatedBy,
                branch.branchId
            ]
        );

    }

    async updateBranchStatus(
        connection,
        branchId,
        status,
        updatedBy
    ) {

        await connection.execute(
            `
        UPDATE branches
        SET
            status = ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            branch_id = ?
        AND
            deleted_at IS NULL
        `,
            [
                status,
                updatedBy,
                branchId
            ]
        );

    }

    async softDeleteBranch(
        connection,
        branchId,
        deletedBy
    ) {

        await connection.execute(
            `
        UPDATE branches
        SET
            status = 'INACTIVE',
            deleted_at = CURRENT_TIMESTAMP,
            deleted_by = ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            branch_id = ?
        AND
            deleted_at IS NULL
        `,
            [
                deletedBy,
                deletedBy,
                branchId
            ]
        );

    }
}

export default new BranchRepository();