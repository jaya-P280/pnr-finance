import auditRepository from "./audit.repository.js";

class AuditService{
    async log(data){
        await auditRepository.create(data);
    }
}

export default new AuditService();