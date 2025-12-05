import { Note } from "../models/notes.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiErrorResponse } from "../utils/api-error-response.js";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

export const canAccessNote = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		if (!Types.ObjectId.isValid(req.params.noteId)) {
			throw new ApiErrorResponse(404, "invalid note id");
		}

		const note = await Note.findById(req.params.noteId);

		if (!note) {
			throw new ApiErrorResponse(404, "note not found");
		}

		if (!note.project?.equals(req.project?._id)) {
			throw new ApiErrorResponse(
				403,
				"note does not belong to this project",
			);
		}

		req.note = note;
		next();
	},
);
