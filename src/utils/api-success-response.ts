export class ApiSuccessResponse {
	success: boolean;
	statusCode: number;
	message: string;
	data?: any;

	constructor(
		success: boolean,
		statusCode: number,
		message: string,
		data?: any,
	) {
		this.success = success;
		this.statusCode = statusCode;
		this.message = message;
		this.data = data;
	}
}
