import pool from "../../database/db.js";

class AuditRepository{
    async create(log){
         const {
        userId,
        action,
        module,
        description,
        ipAddress,
        userAgent
    } = log;

    await pool.execute(
        `
        INSERT INTO audit_logs
        (
            user_id,
            action,
            module,
            description,
            ip_address,
            user_agent
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            action,
            module,
            description,
            ipAddress,
            userAgent
        ]);
    }

    

}

export default new AuditRepository();