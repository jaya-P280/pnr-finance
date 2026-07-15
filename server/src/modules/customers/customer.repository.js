import pool from "../../database/db.js";

class CustomerRepository {

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

    async getLastCustomerCode(connection) {

        const [rows] = await connection.execute(
            `
            SELECT customer_code
            FROM customers
            ORDER BY customer_id DESC
            LIMIT 1
            `
        );

        return rows[0] || null;

    }

    async branchExists(connection, branchId) {

        const [rows] = await connection.execute(
            `
            SELECT branch_id
            FROM branches
            WHERE
                branch_id = ?
            AND
                status = 'ACTIVE'
            AND
                deleted_at IS NULL
            LIMIT 1
            `,
            [branchId]
        );

        return rows[0] || null;

    }

    async mobileExists(connection, mobileNumber) {

        const [rows] = await connection.execute(
            `
            SELECT customer_id
            FROM customers
            WHERE
                mobile_number = ?
            AND
                deleted_at IS NULL
            LIMIT 1
            `,
            [mobileNumber]
        );

        return rows.length > 0;

    }

    async emailExists(connection, email) {

        if (!email) {

            return false;

        }

        const [rows] = await connection.execute(
            `
            SELECT customer_id
            FROM customers
            WHERE
                email = ?
            AND
                deleted_at IS NULL
            LIMIT 1
            `,
            [email]
        );

        return rows.length > 0;

    }

    async aadhaarExists(connection, aadhaarNumber) {

        if (!aadhaarNumber) {

            return false;

        }

        const [rows] = await connection.execute(
            `
            SELECT customer_id
            FROM customers
            WHERE
                aadhaar_number = ?
            AND
                deleted_at IS NULL
            LIMIT 1
            `,
            [aadhaarNumber]
        );

        return rows.length > 0;

    }

    async panExists(connection, panNumber) {

        if (!panNumber) {

            return false;

        }

        const [rows] = await connection.execute(
            `
            SELECT customer_id
            FROM customers
            WHERE
                pan_number = ?
            AND
                deleted_at IS NULL
            LIMIT 1
            `,
            [panNumber]
        );

        return rows.length > 0;

    }

    async createCustomer(connection, customer) {

        const [result] = await connection.execute(
            `
            INSERT INTO customers
            (
                customer_code,
                branch_id,
                first_name,
                last_name,
                gender,
                date_of_birth,
                mobile_number,
                alternate_mobile,
                email,
                aadhaar_number,
                pan_number,
                occupation,
                monthly_income,
                address,
                city,
                state,
                pincode,
                created_by
            )
            VALUES
            (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            `,
            [
                customer.customerCode,
                customer.branchId,
                customer.firstName,
                customer.lastName,
                customer.gender,
                customer.dateOfBirth,
                customer.mobileNumber,
                customer.alternateMobile,
                customer.email,
                customer.aadhaarNumber,
                customer.panNumber,
                customer.occupation,
                customer.monthlyIncome,
                customer.address,
                customer.city,
                customer.state,
                customer.pincode,
                customer.createdBy
            ]
        );

        return result.insertId;

    }

    async getCustomers(filters) {

        const {
            page,
            limit,
            search,
            branchId,
            status,
            sortBy,
            sortOrder
        } = filters;

        const allowedSortColumns = {

            created_at: "c.created_at",

            customer_code: "c.customer_code",

            first_name: "c.first_name"

        };

        const orderColumn =
            allowedSortColumns[sortBy] || "c.created_at";

        const orderDirection =
            sortOrder?.toUpperCase() === "ASC"
                ? "ASC"
                : "DESC";

        let sql = `
            SELECT

                c.customer_id,
                c.customer_code,
                c.first_name,
                c.last_name,
                c.mobile_number,
                c.email,
                c.gender,
                c.city,
                c.state,
                c.status,
                b.branch_name,
                c.created_at

            FROM customers c

            INNER JOIN branches b

                ON b.branch_id = c.branch_id

            WHERE

                c.deleted_at IS NULL
        `;

        const values = [];

        if (search) {

            sql += `
                AND
                (
                    c.customer_code LIKE ?
                    OR c.first_name LIKE ?
                    OR c.last_name LIKE ?
                    OR c.mobile_number LIKE ?
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

        if (branchId) {

            sql += ` AND c.branch_id = ?`;

            values.push(branchId);

        }

        if (status) {

            sql += ` AND c.status = ?`;

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

        const [rows] = await pool.query(

            sql,

            values

        );

        return rows;

    }

    async countCustomers(filters) {

        const {

            search,

            branchId,

            status

        } = filters;

        let sql = `
            SELECT

                COUNT(*) AS total

            FROM customers

            WHERE

                deleted_at IS NULL
        `;

        const values = [];

        if (search) {

            sql += `
                AND
                (
                    customer_code LIKE ?
                    OR first_name LIKE ?
                    OR last_name LIKE ?
                    OR mobile_number LIKE ?
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

        if (branchId) {

            sql += ` AND branch_id = ?`;

            values.push(branchId);

        }

        if (status) {

            sql += ` AND status = ?`;

            values.push(status);

        }

        const [rows] = await pool.execute(

            sql,

            values

        );

        return rows[0].total;

    }

    async getCustomerById(customerId) {

        const [rows] = await pool.execute(
            `
            SELECT

                c.*,

                b.branch_name

            FROM customers c

            INNER JOIN branches b

                ON b.branch_id = c.branch_id

            WHERE

                c.customer_id = ?

            AND

                c.deleted_at IS NULL

            LIMIT 1
            `,
            [customerId]
        );

        return rows[0] || null;

    }

    async findByEmail(email) {

        if (!email) {

            return null;

        }

        const [rows] = await pool.execute(
            `
        SELECT customer_id
        FROM customers
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

    async findByMobile(mobileNumber) {

        const [rows] = await pool.execute(
            `
        SELECT customer_id
        FROM customers
        WHERE
            mobile_number = ?
        AND
            deleted_at IS NULL
        LIMIT 1
        `,
            [mobileNumber]
        );

        return rows[0] || null;

    }

    async findByAadhaar(aadhaarNumber) {

        if (!aadhaarNumber) {

            return null;

        }

        const [rows] = await pool.execute(
            `
        SELECT customer_id
        FROM customers
        WHERE
            aadhaar_number = ?
        AND
            deleted_at IS NULL
        LIMIT 1
        `,
            [aadhaarNumber]
        );

        return rows[0] || null;

    }

    async findByPan(panNumber) {

        if (!panNumber) {

            return null;

        }

        const [rows] = await pool.execute(
            `
        SELECT customer_id
        FROM customers
        WHERE
            pan_number = ?
        AND
            deleted_at IS NULL
        LIMIT 1
        `,
            [panNumber]
        );

        return rows[0] || null;

    }

    async updateCustomer(connection, customer) {

        await connection.execute(
            `
        UPDATE customers
        SET
            branch_id = ?,
            first_name = ?,
            last_name = ?,
            gender = ?,
            date_of_birth = ?,
            mobile_number = ?,
            alternate_mobile = ?,
            email = ?,
            aadhaar_number = ?,
            pan_number = ?,
            occupation = ?,
            monthly_income = ?,
            address = ?,
            city = ?,
            state = ?,
            pincode = ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            customer_id = ?
        AND
            deleted_at IS NULL
        `,
            [
                customer.branchId,
                customer.firstName,
                customer.lastName,
                customer.gender,
                customer.dateOfBirth,
                customer.mobileNumber,
                customer.alternateMobile,
                customer.email,
                customer.aadhaarNumber,
                customer.panNumber,
                customer.occupation,
                customer.monthlyIncome,
                customer.address,
                customer.city,
                customer.state,
                customer.pincode,
                customer.updatedBy,
                customer.customerId
            ]
        );

    }

    async updateCustomerStatus(
        connection,
        customerId,
        status,
        updatedBy
    ) {

        await connection.execute(
            `
        UPDATE customers
        SET
            status = ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            customer_id = ?
        AND
            deleted_at IS NULL
        `,
            [
                status,
                updatedBy,
                customerId
            ]
        );

    }

    async softDeleteCustomer(
        connection,
        customerId,
        deletedBy
    ) {

        await connection.execute(
            `
        UPDATE customers
        SET
            status = 'INACTIVE',
            deleted_at = CURRENT_TIMESTAMP,
            deleted_by = ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            customer_id = ?
        AND
            deleted_at IS NULL
        `,
            [
                deletedBy,
                deletedBy,
                customerId
            ]
        );

    }

}

export default new CustomerRepository();