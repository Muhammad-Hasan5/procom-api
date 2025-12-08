import { body } from "express-validator";
export const taskValidator = () => {
    return [
        body("title")
            .notEmpty()
            .withMessage("Task title is required")
            .isString()
            .withMessage("Title must be a string")
            .trim(),
        body("description")
            .optional()
            .isString()
            .withMessage("Description must be a string"),
        body("assignedTo")
            .notEmpty()
            .withMessage("assignedTo is required")
            .isEmail()
            .withMessage("assignedTo must be a valid email")
            .bail()
            .toLowerCase()
            .trim(),
        body("status")
            .optional()
            .isIn(["todo", "in-progress", "review", "done"])
            .withMessage("Invalid task status"),
    ];
};
