import { ApiSuccessResponse } from "../utils/api-success-response.js";
import { asyncHandler } from "../utils/async-handler.js";
export const healthcheck = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiSuccessResponse(true, 200, "Health Checking successfull", "no data for now"));
});
