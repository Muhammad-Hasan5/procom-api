export class ApiSuccessResponse {
    constructor(success, statusCode, message, data) {
        this.success = success;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}
