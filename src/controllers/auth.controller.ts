import { ApiSuccessResponse } from "../utils/api-success-response.js";
import { ApiErrorResponse } from "../utils/api-error-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/users.model.js";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { RefreshTokenPayload } from "../types/TokensPayload.types.js";
import { sendEmail } from "../utils/mail.js";
import { UserDocument } from "../types/UserModel.types.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
	const { fullname, username, email, password } = await req.body;

	const isUserExist = await User.findOne({
		$or: [{ email, username }],
	});

	if (isUserExist) {
		if (isUserExist.email) {
			throw new ApiErrorResponse(
				499,
				"User with this email already registered",
			);
		}
		if (isUserExist.username) {
			throw new ApiErrorResponse(
				499,
				"User with this email already registered",
			);
		}
	}

	const user = await User.create({
		fullname,
		username,
		email,
		password,
		isEmailVerified: false,
	});

	const { unHashedToken, hashedToken, expiryTime } =
		user.generateTemporaryToken();

	user.emailVerificationToken = hashedToken;
	user.emailVerificationTokenExpiry = expiryTime;

	await user.save({ validateBeforeSave: false });

	//send email:
	await sendEmail({
		to: user?.email,
		subject: "Verify your email",
		html: `<p>Welcome! Please verify your email to activate your account by clicking <a href="${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}">here</a>.</p>`,
	});

	const createdUser = await User.findById(user?._id).select(
		"-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgetPasswordTokenExpiry",
	);

	if (!createdUser) {
		throw new ApiErrorResponse(500, "User not created");
	}

	return res
		.status(201)
		.json(
			new ApiSuccessResponse<UserDocument>(
				true,
				201,
				"User created successfully",
				createdUser,
			),
		);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
	const { email, password } = await req.body;

	const user = await User.findOne({ email });
	if (!user) {
		throw new ApiErrorResponse(404, "User with this email not found");
	}

	const isPasswordCorrect = await user.isPasswordCorrect(password);
	if (!isPasswordCorrect) {
		throw new ApiErrorResponse(404, "Incorrect password");
	}

	const refreshToken = user.generateRefreshToken();
	const accessToken = user.generateAccessToken();

	user.refreshToken = refreshToken;

	await user.save({ validateBeforeSave: false });

	const loggedInUser = await User.findById(user?._id).select(
		"-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgetPasswordToken -forgetPasswordTokenExpiry",
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.cookie("refreshToken", refreshToken, options)
		.cookie("accessToken", accessToken, options)
		.json(
			new ApiSuccessResponse<any>(true, 200, "User logged in", loggedInUser),
		);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
	await User.findByIdAndUpdate(
		req.user?._id,
		{
			$set: {
				refreshToken: "",
			},
		},
		{
			$new: true,
		},
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(
			new ApiSuccessResponse<null>(true, 200, "User logged out successfully", null),
		);
});

export const getCurrentUser = asyncHandler(
	async (req: Request, res: Response) => {
		return res
			.status(200)
			.json(
				new ApiSuccessResponse<UserDocument>(
					true,
					200,
					"user fetched successfully",
					req.user,
				),
			);
	},
);

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
	const { verificationToken } = req.params;
	if (!verificationToken) {
		throw new ApiErrorResponse(404, "No token found");
	}

	const hashedVerificationToken = crypto
		.createHash("sha256")
		.update(verificationToken)
		.digest("hex");

	const user = await User.findOne({
		emailVerificationToken: hashedVerificationToken,
		emailVerificationTokenExpiry: { $gt: Date.now() },
	});

	if (!user) {
		throw new ApiErrorResponse(404, "User not found");
	}

	user.emailVerificationToken = undefined;
	user.emailVerificationTokenExpiry = undefined;
	user.isEmailVerified = true;
	await user.save({ validateBeforeSave: false });

	return res.status(200).json(
		new ApiSuccessResponse<object>(true, 200, "Email verified", {
			isEmailVerified: true,
		}),
	);
});

export const resendEmailVerificationMail = asyncHandler(
	async (req: Request, res: Response) => {
		const user = req.user;
		if (!user) {
			throw new ApiErrorResponse(404, "user not validated");
		}
		if (user.isEmailVerified) {
			throw new ApiErrorResponse(409, "User is already verified");
		}
		const { unHashedToken, hashedToken, expiryTime } =
			user.generateTemporaryToken();

		user.emailVerificationToken = hashedToken;
		user.emailVerificationTokenExpiry = expiryTime;
		await user.save({ validateBeforeSave: false });

		//send email
		await sendEmail({
			to: user?.email,
			subject: "Verify your email",
			html: `<p>Welcome! Please verify your email to activate your account by clicking <a href="${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}">here</a>.</p>`,
		});

		return res
			.status(200)
			.json(new ApiSuccessResponse<null>(true, 200, "email send successfully", null));
	},
);

export const renewAccessToken = asyncHandler(
	async (req: Request, res: Response) => {
		const incomingRefreshToken =
			req.cookies.refreshToken || req.body.refreshToken;

		if (!incomingRefreshToken) {
			throw new ApiErrorResponse(400, "no refresh token found");
		}

		const decodedRefreshToken = jwt.verify(
			incomingRefreshToken,
			process.env.ACCESS_TOKEN_SECRET as string,
		) as RefreshTokenPayload;

		if (!decodedRefreshToken) {
			throw new ApiErrorResponse(500, "Token not decoded successfully");
		}

		const user = await User.findById(decodedRefreshToken._id);

		if (!user) {
			throw new ApiErrorResponse(404, "User not found");
		}

		if (incomingRefreshToken !== user.refreshToken) {
			throw new ApiErrorResponse(404, "Invalid refresh token");
		}

		const newRefreshToken = user.generateRefreshToken();
		const newAccessToken = user.generateAccessToken();

		user.refreshToken = newRefreshToken;
		await user.save({ validateBeforeSave: false });

		const options = {
			httpOnly: true,
			secure: true,
		};

		return res
			.status(200)
			.cookie("accessToken", newAccessToken, options)
			.cookie("refreshToken", newRefreshToken, options)
			.json(
				new ApiSuccessResponse<object>(
					true,
					200,
					"Access token renewed successfully",
					{
						accessToken: newAccessToken,
						refreshToken: newRefreshToken,
					},
				),
			);
	},
);

export const forgotPasswordRequest = asyncHandler(
	async (req: Request, res: Response) => {
		const { email } = req.body;

		const user = await User.findOne({ email });

		if (!user) {
			throw new ApiErrorResponse(
				404,
				"Incorrect email no user found having such email",
			);
		}

		const { unHashedToken, hashedToken, expiryTime } =
			user.generateTemporaryToken();

		user.forgetPasswordToken = hashedToken;
		user.forgetPasswordTokenExpiry = expiryTime;
		await user.save({ validateBeforeSave: false });

		//send email
		await sendEmail({
			to: user?.email,
			subject: "Reset your forgot password",
			html: `<p>You requested a password reset. Click <a href="${req.protocol}://${req.get("host")}/api/v1/users/forgot-password/${unHashedToken}">here</a> to set a new password. This link expires in 5 minutes.</p>`,
		});

		return res
			.status(200)
			.json(
				new ApiSuccessResponse<null>(
					true,
					200,
					"forgot password request processed",
					null
				),
			);
	},
);

export const resetForgotPassword = asyncHandler(
	async (req: Request, res: Response) => {
		const { resetToken } = req.params;
		const { newPassword } = req.body;

		const hashedResetPasswordToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		const user = await User.findOne({
			forgetPasswordToken: hashedResetPasswordToken,
			forgetPasswordTokenExpiry: { $gt: Date.now() },
		});

		if (!user) {
			throw new ApiErrorResponse(
				404,
				"Mabe invalid reset password token or token is expired",
			);
		}

		user.forgetPasswordToken = undefined;
		user.forgetPasswordTokenExpiry = undefined;
		user.password = newPassword;
		await user.save({ validateBeforeSave: false });

		//send email
		await sendEmail({
			to: user?.email,
			subject: "Verify your email",
			html: `<p>Your password has been successfully reset. You can now <a href="${req.protocol}://${req.get("host")}/api/v1/users/login-user">log in</a> with your new password.</p>`,
		});

		return res
			.status(200)
			.json(
				new ApiSuccessResponse<null>(
					true,
					200,
					"password reset successfully",
					null
				),
			);
	},
);

export const changeCurrentPassword = asyncHandler(
	async (req: Request, res: Response) => {
		const { oldPassword, newPassword } = req.body;

		const user = await User.findById(req.user?._id);

		if (!user) {
			throw new ApiErrorResponse(404, "User not found");
		}

		const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

		if (!isPasswordCorrect) {
			throw new ApiErrorResponse(500, "Incorrect old password");
		}

		user.password = newPassword;
		await user.save({ validateBeforeSave: false });

		//send email
		await sendEmail({
			to: user?.email,
			subject: "Verify your email",
			html: `<p>Your password has been successfully changed. If you didn't do this, please contact support immediately.</p>`,
		});

		return res
			.status(200)
			.json(
				new ApiSuccessResponse<null>(
					true,
					200,
					"password changed successfully",
					null,
				),
			);
	},
);

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
	const deletedUser = await User.findByIdAndDelete(req.user?._id);
	if (!deletedUser) {
		throw new ApiErrorResponse(404, "user not found");
	}
	return res
		.status(200)
		.json(
			new ApiSuccessResponse<UserDocument>(
				true,
				200,
				"User deleted successfully",
				deletedUser,
			),
		);
});
