import { Request, Response, NextFunction } from "express";

export type RequestHandlerType =
	| ((req: Request, res: Response) => Promise<unknown>)
	| ((req: Request, res: Response, next: NextFunction) => Promise<unknown>);
