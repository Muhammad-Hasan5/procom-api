export class ApiErrorResponse extends Error {
	statusCode: number;
	message: string;
	errors: any[];
	stack?: string | undefined;

	constructor(
		statusCode: number,
		message: string,
		errors: any[] = [],
		stack?: string | undefined,
	) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
		this.errors = errors;
		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
