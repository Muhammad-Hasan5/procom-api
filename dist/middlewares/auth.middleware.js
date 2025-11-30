import { ApiErrorResponse } from "../utils/api-error-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/users.model.js";
import jwt from "jsonwebtoken";
export const authMiddleware = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    if (!accessToken) {
        throw new ApiErrorResponse(404, "Access token not found, user not authenticated");
    }
    try {
        const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if (!decodedAccessToken) {
            throw new ApiErrorResponse(401, "Unable to decode the fetched token");
        }
        const user = await User.findById(decodedAccessToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
        if (!user) {
            throw new ApiErrorResponse(404, "user not found");
        }
        req.user = user;
        next();
    }
    catch (error) {
        throw new ApiErrorResponse(401, "Unable to decode the fetched token");
    }
});
