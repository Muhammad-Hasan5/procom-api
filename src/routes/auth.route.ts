import { Router } from "express";
import {
	register,
	login,
	logout,
	getCurrentUser,
	verifyEmail,
	resendEmailVerificationMail,
	renewAccessToken,
	forgotPasswordRequest,
	changeCurrentPassword,
	resetForgotPassword,
	deleteUser,
} from "../controllers/auth.controller.js";
import {
	userRegistervalidator,
	userLoginValidator,
	changePasswordValidator,
	forgotPasswordValidator,
	resetPasswordValidator,
} from "../validators/auth.validator.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validators.middleware.js";

const router = Router();

router
	.route("/register-user")
	.post(userRegistervalidator(), validate, register);
router.route("/login-user").post(userLoginValidator(), validate, login);
router.route("/logout-user").post(authMiddleware, logout);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router
	.route("/resend-email-verification")
	.post(authMiddleware, resendEmailVerificationMail);
router.route("/refresh-token").post(renewAccessToken);
router
	.route("/forgot-password")
	.post(forgotPasswordValidator(), validate, forgotPasswordRequest);
router
	.route("/reset-password/:resetToken")
	.patch(resetPasswordValidator(), validate, resetForgotPassword);
router
	.route("/change-password")
	.patch(
		authMiddleware,
		changePasswordValidator(),
		validate,
		changeCurrentPassword,
	);
router.route("/get-current-user").get(authMiddleware, getCurrentUser);
router.route("/delete-user").delete(authMiddleware, deleteUser);

export default router;
