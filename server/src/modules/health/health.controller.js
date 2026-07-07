import healthService from "./health.service.js";
import ApiResponse from "../../shared/ApiResponse.js";

class HealthController {
    getHealth(req,res){
        return res.status(200).json(
            new ApiResponse(
                200,
                "Application Running",
                healthService.getHealthStatus()
            )
        );
    }
}

export default new HealthController();