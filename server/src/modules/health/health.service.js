

class HealthService{
    getHealthStatus(){
        return {
            status:"up",
            application: "PNRG Finance API",
            version:"1.0.0",
            timestamp: new Date()
        };
    }
}

export default new HealthService();