class ApiError extends Error{
    constructor(statuscode,message){
        super(message);
        this.success = false;
        this.statuscode = statuscode;
        Error.captureStackTrace(this,this.constructor);
    }
}

export default ApiError;