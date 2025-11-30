import { validationResult } from "express-validator";
import { ApiErrorResponse } from "../utils/api-error-response.js";
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const errorsArray = [];
    errors.array().map((err) => {
        errorsArray.push({
            [err.type]: err.msg
        });
    });
    throw new ApiErrorResponse(400, "recieved data is not valid", errorsArray);
};
