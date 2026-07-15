import pool from "../../../database/db.js";

class PasswordResetRepository {

    /* ==========================================================
        CREATE PASSWORD TOKEN
    ========================================================== */

    async createToken(connection, token) {

        const [result] = await connection.execute(
            `
            INSERT INTO password_reset_tokens
            (
                user_id,
                token_hash,
                purpose,
                expires_at
            )
            VALUES
            (
                ?, ?, ?, ?
            )
            `,
            [
                token.userId,
                token.tokenHash,
                token.purpose,
                token.expiresAt
            ]
        );

        return result.insertId;

    }

    /* ==========================================================
        FIND VALID TOKEN
    ========================================================== */

    async findValidToken(tokenHash) {

        const [rows] = await pool.execute(
            `
            SELECT
                token_id,
                user_id,
                purpose,
                expires_at,
                used_at
            FROM password_reset_tokens
            WHERE
                token_hash = ?
                AND expires_at > NOW()
                AND used_at IS NULL
            LIMIT 1
            `,
            [tokenHash]
        );

        return rows[0] || null;

    }

    /* ==========================================================
        INVALIDATE USER TOKENS
    ========================================================== */

    async invalidateUserTokens(connection, userId, purpose) {

        await connection.execute(
            `
            UPDATE password_reset_tokens
            SET
                used_at = NOW()
            WHERE
                user_id = ?
                AND purpose = ?
                AND used_at IS NULL
            `,
            [
                userId,
                purpose
            ]
        );

    }

    /* ==========================================================
        MARK TOKEN USED
    ========================================================== */

    async markTokenUsed(connection, tokenId) {

        await connection.execute(
            `
            UPDATE password_reset_tokens
            SET
                used_at = NOW()
            WHERE
                token_id = ?
            `,
            [tokenId]
        );

    }

    /* ==========================================================
        DELETE EXPIRED TOKENS (Optional Cleanup Job)
    ========================================================== */

    async deleteExpiredTokens(connection) {

        await connection.execute(
            `
            DELETE FROM password_reset_tokens
            WHERE expires_at < NOW()
            `
        );

    }

    async getUserByToken(tokenHash) {

        const [rows] = await pool.execute(

            `
        SELECT

            prt.token_id,

            prt.user_id,

            prt.purpose,

            u.email,

            u.first_name,

            u.last_name

        FROM password_reset_tokens prt

        INNER JOIN users u

            ON u.user_id = prt.user_id

        WHERE

            prt.token_hash = ?

        AND

            prt.used_at IS NULL

        AND

            prt.expires_at > NOW()

        LIMIT 1
        `,

            [tokenHash]

        );

        return rows[0] || null;

    }

}

export default new PasswordResetRepository();