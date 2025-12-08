import { body } from "express-validator";
export const projectValidator = () => {
    return [
        body("title")
            .notEmpty()
            .withMessage("Project title is required")
            .isString()
            .withMessage("Title must be a string")
            .trim(),
        body("description")
            .optional()
            .isString()
            .withMessage("Description must be a string"),
        body("members")
            .optional()
            .isArray()
            .withMessage("Members must be an array"),
        body("members.*")
            .optional()
            .isEmail()
            .withMessage("Each member must be a valid email")
            .bail()
            .customSanitizer((email) => email.toLowerCase().trim()),
    ];
};
