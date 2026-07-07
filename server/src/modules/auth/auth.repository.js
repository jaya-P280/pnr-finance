import pool from "../../database/db.js"

class AuthRepository{
    async findUserByEmail(email){
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
            on r.roles_id = u.role.id
            WHERE u.email = ?
            AND u.status = 'ACTIVE'
            `,[email]
        );

        return rows[0];
    }

    async saveRefreshToken(
        userId,
        tokenHash,
        expireAt
    ){
        await pool.execute(
            `
            INSERT INTO refresh_tokens
            (
                user_id,
                token_hash,
                expires_at
            )
            VALUES
            (?,?,?)
            `,
            [
                userId,
                tokenHash,
                expireAt
            ]
        );
    }

}

export default new AuthRepository();