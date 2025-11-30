import { validationResult } from "express-validator";
import { ApiErrorResponse } from "../utils/api-error-response.js";
import { NextFunction, Request, Response } from "express";

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if(errors.isEmpty()){
        return next()
    }
    const errorsArray = [] as any[];
    errors.array().map((err) => {
        errorsArray.push({
            [err.type]: err.msg
        })
    })
    throw new ApiErrorResponse(400, "recieved data is not valid", errorsArray)
}