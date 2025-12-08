import { ApiErrorResponse } from "../utils/api-error-response.js";
import { ApiSuccessResponse } from "../utils/api-success-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Note } from "../models/notes.model.js";
import { Request, Response } from "express";
import { INoteDocument, NoteDocument } from "../types/NotesModel.types.js";

export const createNote = asyncHandler(async (req: Request, res: Response) => {
	const { title, content } = req.body;

	if (!title) {
		throw new ApiErrorResponse(401, "Title is required");
	}

	const note = await Note.create({
		title,
		content,
		user: req.user?._id,
		project: req.project?._id,
	});

	return res
		.status(200)
		.json(new ApiSuccessResponse<NoteDocument>(true, 200, "Note created", note));
});

export const getNote = asyncHandler(async (req: Request, res: Response) => {
	const note = req.note!;

	return res
		.status(200)
		.json(
			new ApiSuccessResponse<NoteDocument>(
				true,
				200,
				"Note retrieved successfully",
				note,
			),
		);
});

export const getNotes = asyncHandler(async (req: Request, res: Response) => {
	const searchQuery = req.query.q as string | undefined;

	let notes;

	if (searchQuery) {
		notes = await Note.find(
			{
				project: req.project?._id,
				$text: { $search: searchQuery },
			},
			{ score: { $meta: "textScore" } },
		).sort({ score: { $meta: "textScore" } });
	} else {
		notes = await Note.find({ project: req.project?._id }).populate("user");
	}

	if (!notes.length) {
		throw new ApiErrorResponse(
			404,
			"User either have no notes or there is problem while fetching",
		);
	}

	return res
		.status(200)
		.json(
			new ApiSuccessResponse<NoteDocument[]>(
				true,
				200,
				"Notes are fetched successfully",
				notes,
			),
		);
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
	const { title, content } = req.body;
	const note = req.note!;

	if (!note) {
		throw new ApiErrorResponse(404, "note not found");
	}

	if (title) note.title = title;
	if (content) note.content = content;

	await note?.save();

	return res
		.status(200)
		.json(
			new ApiSuccessResponse<NoteDocument>(
				true,
				200,
				"note updated successfully",
				note,
			),
		);
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
	const deletedNote = await Note.findOneAndDelete({
		_id: req.note?._id,
		project: req.project?._id,
	});

	if (!deletedNote) {
		throw new ApiErrorResponse(404, "Unable to delete the note");
	}

	return res
		.status(200)
		.json(
			new ApiSuccessResponse<NoteDocument>(
				true,
				200,
				"Note deleted successfully",
				deletedNote,
			),
		);
});

export const archiveNote = asyncHandler(async (req: Request, res: Response) => {
	const { isArchived } = req.body;

	const note = req.note!;

	if (!note) {
		throw new ApiErrorResponse(404, "Invalid not id");
	}

	note.isArchived = isArchived;
	await note.save();

	return res
		.status(200)
		.json(
			new ApiSuccessResponse<NoteDocument>(
				true,
				200,
				"Note is archived successfully",
				note,
			),
		);
});

export const pinNote = asyncHandler(async (req: Request, res: Response) => {
	const { isPinned } = req.body;

	const note = req.note!;

	if (!note) {
		throw new ApiErrorResponse(404, "Invalid not id");
	}

	note.isPinned = isPinned;
	await note.save();

	return res
		.status(200)
		.json(
			new ApiSuccessResponse<NoteDocument>(
				true,
				200,
				"Note is pinned successfully",
				note,
			),
		);
});
