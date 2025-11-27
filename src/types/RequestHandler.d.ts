import { Request, Response, NextFunction } from "express";

export type RequestHandlerType =
	| ((req: Request, res: Response) => Promise<any>)
	| ((req: Request, res: Response, next: NextFunction) => Promise<any>);
