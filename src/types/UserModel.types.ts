import { Model, Document, Types } from "mongoose";

export interface IUser {
	avatar?: {
		url: string | null;
		localPath: string | null;
	};
	username: string;
	fullname: string;
	email: string;
	password: string;
	isEmailVerified?: boolean;
	refreshToken?: string;
	forgetPasswordToken?: string;
	forgetPasswordTokenExpiry?: number;
	emailVerificationToken?: string;
	emailVerificationTokenExpiry?: number;
}

export interface IUserMethods {
	isPasswordCorrect(password: string): Promise<boolean>;
	generateAccessToken(): string;
	generateRefreshToken(): string;
	generateTemporaryToken(): {
		hashedToken: string;
		unHashedToken: string;
		expiryTime: number;
	};
}



export interface UserModel extends Model<IUser, {}, IUserMethods> {}


export type UserDocument = Document<Types.ObjectId> & IUser & IUserMethods;




