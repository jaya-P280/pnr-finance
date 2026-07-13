class ApiError extends Error{
    constructor(statusCode,message,errors = []){
        super(message);
        this.success = false;
        this.statuscode = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this,this.constructor);
    }
}

export default ApiError;