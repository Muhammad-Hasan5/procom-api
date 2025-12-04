import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { IUser, IUserMethods, UserModel } from "../types/UserModel.types.js";

const userSchema = new Schema<IUser, IUserMethods, UserModel>(
	{
		avatar: {
			type: {
				url: String,
				localPath: String,
			},
			default: {
				url: `https://placehold.co/200x200`,
				localPath: "",
			},
		},
		username: {
			type: String,
			trim: true,
			unique: true,
			required: true,
			lowercase: true,
			index: true,
		},
		fullname: {
			type: String,
			trim: true,
			required: true,
			lowercase: true,
		},
		email: {
			type: String,
			trim: true,
			required: true,
			lowercase: true,
			unique: true,
		},
		password: {
			type: String,
			required: [true, "Password is required to be registered as a user"],
		},
		isEmailVerified: {
			type: Boolean,
			required: true,
		},
		refreshToken: {
			type: String,
			default: null,
		},
		forgetPasswordToken: {
			type: String,
		},
		forgetPasswordTokenExpiry: {
			type: Number,
		},
		emailVerificationToken: {
			type: String,
		},
		emailVerificationTokenExpiry: {
			type: Number,
		},
	},
	{
		timestamps: true,
	},
);

userSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id as string,
			username: this.username,
			email: this.email,
		},
		process.env.ACCESS_TOKEN_SECRET as string,
		{
			expiresIn: "1hr",
			algorithm: "HS256",
		},
	);
};

userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id as string,
		},
		process.env.REFRESH_TOKEN_SECRET as string,
		{
			expiresIn: "1d",
			algorithm: "HS256",
		},
	);
};

userSchema.methods.generateTemporaryToken = function () {
	const unHashedToken: string = crypto.randomBytes(20).toString("hex");
	const hashedToken: string = crypto.createHash("sha256").update(unHashedToken).digest("hex");
	const expiryTime = Date.now() + 5 * 60 * 1000;
	return { unHashedToken, hashedToken, expiryTime };
};

export const User = mongoose.model<IUser, UserModel>("User", userSchema)