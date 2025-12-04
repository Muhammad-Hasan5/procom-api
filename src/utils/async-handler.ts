import { NextFunction, Request, Response } from "express";
import { RequestHandlerType } from "../types/RequestHandler.types.js";

export const asyncHandler = (requestHandler: RequestHandlerType) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(
			requestHandler(req, res, next).catch((error: unknown) =>
				next(error),
			),
		);
	};
};
