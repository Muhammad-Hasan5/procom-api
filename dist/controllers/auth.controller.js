import { ApiSuccessResponse } from "../utils/api-success-response.js";
import { ApiErrorResponse } from "../utils/api-error-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/users.model.js";
import { sendEmail, emailVerificationMailgenContent, } from "../utils/mail.js";
export const register = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = await req.body;
    const isUserExist = await User.findOne({
        $or: [{ email, username }],
    });
    if (isUserExist) {
        if (isUserExist.email) {
            throw new ApiErrorResponse(499, "User with this email already registered");
        }
        if (isUserExist.username) {
            throw new ApiErrorResponse(499, "User with this email already registered");
        }
    }
    const user = await User.create({
        fullname,
        username,
        email,
        password,
        isEmailVerified: false,
    });
    const { unHashedToken, hashedToken, expiryTime } = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = expiryTime;
    await user.save({ validateBeforeSave: false });
    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(user?.username, `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`),
    });
    const createdUser = await User.findById(user?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgetPasswordTokenExpiry");
    if (!createdUser) {
        throw new ApiErrorResponse(500, "User not created");
    }
    return res
        .status(201)
        .json(new ApiSuccessResponse(true, 201, "User created successfully", createdUser));
});
