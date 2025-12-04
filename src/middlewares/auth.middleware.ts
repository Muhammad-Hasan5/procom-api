import { NextFunction, Request, Response } from "express";
import { ApiErrorResponse } from "../utils/api-error-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/users.model.js";
import jwt from "jsonwebtoken";
import { AccessTokenPayload } from "../types/TokensPayload.types.js";

export const authMiddleware = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		const accessToken =
			req.cookies?.accessToken ||
			req.header("Authorization")?.replace("Bearer ", "");

		if (!accessToken) {
			throw new ApiErrorResponse(
				404,
				"Access token not found, user not authenticated",
			);
		}

		try {
			const decodedAccessToken = jwt.verify(
				accessToken,
				process.env.ACCESS_TOKEN_SECRET as string,
			) as AccessTokenPayload;

			if (!decodedAccessToken) {
				throw new ApiErrorResponse(
					401,
					"Unable to decode the fetched token",
				);
			}

			const user = await User.findById(decodedAccessToken?._id).select(
				"-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
			);

			if (!user) {
				throw new ApiErrorResponse(404, "user not found");
			}

			req.user = user;
			next();
		} catch (error) {
			throw new ApiErrorResponse(
				401,
				"Unable to decode the fetched token",
			);
		}
	},
);
