import { body } from "express-validator";

export const notesValidator = () => {
	return [
		body("title").trim().notEmpty().withMessage("title is required"),
		body("content").trim(),
	];
};
