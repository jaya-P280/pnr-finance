import pool from "../../database/db.js"

class AuthRepository {
    async findUserByEmail(email) {
        const [rows] = await pool.execute(
            `
            SELECT 
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.password_hash,
                u.branch_id,
                u.role_id,
                r.role_name
            FROM users u
            INNER JOIN roles r
                on r.role_id = u.role_id
            WHERE u.email = (?)
            AND u.status = 'ACTIVE'
            `, [email]
        );

        return rows[0];
    }

    async findUserById(UserId) {
        const [rows] = await pool.execute(
            `
            SELECT 
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.role_id,
                u.branch_id,
                r.role_name
            FROM users u
            INNER JOIN roles r
                ON r.role_id = u.role_id
            WHERE 
                u.user_id = ?
             AND
             u.status = 'ACTIVE';`,
            [UserId]
        );

        return rows[0];
    }

    async saveRefreshToken(
        userId,
        tokenHash,
        expireAt
    ) {
        await pool.execute(
            `
            INSERT INTO refresh_tokens
            (
                user_id,
                token_hash ,
                expires_at 
            ) VALUES (?,?,?)
            `,
            [
                userId,
                tokenHash,
                expireAt
            ]
        );
    }

    async findRefreshToken(hash) {
        const [rows] = await pool.execute(
            `
            SELECT * 
            FROM refresh_tokens
            WHERE token_hash=?
            AND is_revoked = FALSE ;
            `,
            [hash]
        );
        return rows[0];
    }

    async updateRefreshToken(
        userId,
        tokenHash,
        expireAt
    ) {
        await pool.execute(
            `
            UPDATE refresh_tokens
            SET
                token_hash = ?,
                expires_at = ?,
                updated_at = NOW()
            WHERE user_id = ?; 
            `,
            [
                tokenHash,
                expireAt,
                userId
            ]
        );
    }

    async revokeRefreshToken(userId) {
        await pool.execute(
            `
            DELETE FROM refresh_tokens 
            WHERE user_id = ? ;
            `, [userId]
        );
    }

}

export default new AuthRepository();