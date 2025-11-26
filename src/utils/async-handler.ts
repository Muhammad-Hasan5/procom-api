import { NextFunction, Request, Response } from "express";
import { Controller } from "../types/Controller.js";

export const asyncHandler = (requestHandler: Controller) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(
			requestHandler(req, res, next).catch((error: unknown) => next(error)),
		);
	};
};
