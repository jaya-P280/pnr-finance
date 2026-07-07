import pool from "../../database/db.js";

class AuditRepository{
    async create(log){
        const sql = `
        INSERT INTO audit_logs(
            user_id,
            action,
            module,
            description,
            ip_address,
            user_agent
        ) VALUES (?,?,?,?,?,?);`
         await pool.execute(
            sql,
            [
                log.UserId,
                log.action,
                log.module,
                log.description,
                log.ipaddress,
                log.userAgent
            ]);
    }

}

export default new AuditRepository();