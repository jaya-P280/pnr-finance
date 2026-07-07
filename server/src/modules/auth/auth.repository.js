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
            on r.role_id = u.role_id
            WHERE u.email = ?
            AND u.status = 'ACTIVE;'
            `,[email]
        );

        return rows[0];
    }

    async findUserById(UserId){
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
             u.status = 'Active';`,
             [UserId]
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
                is_revoked
            )
            VALUES
            (?,?,?);
            `,
            [
                userId,
                tokenHash,
                expireAt,
                false
            ]
        );
    }

    async findRefreshToken(hash){
        const [rows] = await pool.execute(
            `
            SELECT * 
            FROM refresh_tokens
            WHERE token_hash=?
            AND is_revoked ;
            `,
            [hash]
        );
        return rows[0];
    }

    async revokeRefreshToken(hash){
        await pool.execute(
            `
            UPDATE refresh_tokens
            SET is_revoked = true
            WHERE token_hash= ?;
            `,[hash]
        );
    }

}

export default new AuthRepository();