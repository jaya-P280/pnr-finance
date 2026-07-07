class ApiError extends Error{
    constructor(statuscode,message,errors = []){
        super(message);
        this.success = false;
        this.statuscode = statuscode;
        this.errors = errors;
        Error.captureStackTrace(this,this.constructor);
    }
}

export default ApiError;