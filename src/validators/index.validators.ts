import { body } from "express-validator";

export const userRegistervalidator = () => {
	return [
		body("email")
			.trim()
			.notEmpty()
			.withMessage("email is required")
			.isEmail()
			.withMessage("email is invalid"),
		body("username")
			.trim()
			.notEmpty()
			.withMessage("username is required")
			.isLowercase()
			.withMessage("username should be i lowercase")
			.isLength({ min: 3 })
			.withMessage("username must be atleast 3 characters long"),
		body("password")
			.trim()
			.notEmpty()
			.withMessage("password is required")
			.isLength({ min: 8 })
			.withMessage("password must be 8 characters long"),
		body("fullname").trim(),
	];
};

export const userLoginValidator = () => {
	return [
		body("email").optional().isEmail().withMessage("email is not valid"),
		body("password").notEmpty().withMessage("password is required"),
	];
};

export const changePasswordValidator = function () {
	return [
		body("oldPassword").notEmpty().withMessage("Old password is required"),
		body("newPassword")
			.notEmpty()
			.withMessage("new password is required")
			.isLength({ min: 8 })
			.withMessage("password must contain 8 characters"),
	];
};

export const forgotPasswordValidator = function () {
	return [
		body("email")
			.notEmpty()
			.withMessage("email is required")
			.isEmail()
			.withMessage("email is invalid"),
	];
};

export const resetPasswordValidator = function () {
	return [
		body("newPassword")
			.notEmpty()
			.withMessage("new password is required")
			.isLength({ min: 8 })
			.withMessage("password must contain 8 characters"),
	];
};
