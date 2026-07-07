class ApiResponse{
    constructor(statuscode, message, data = null,meta = null){
        this.success = true;
        this.statuscode = statuscode;
        this.message = message;
        this.data = data;
        this.meta = meta ;
        this.timestamp = new Date().toISOString();
    }
}

export default ApiResponse;