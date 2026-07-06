class ApiResponse{
    constructor(statuscode, message, data = null){
        this.success = true;
        this.statuscode = statuscode;
        this.message = message;
        this.data = data;
    }
}

export default ApiResponse;