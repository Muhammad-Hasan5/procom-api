import { ApiErrorResponse } from "../utils/api-error-response.js";
import { ApiSuccessResponse } from "../utils/api-success-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Note } from "../models/notes.model.js";
import { Request, Response } from "express";

export const createNote = asyncHandler(async (req: Request, res: Response) => {
	const { title, content } = req.body;
	const user_id = req.user?._id;

	if (!title) {
		throw new ApiErrorResponse(401, "Title is required");
	}

	const note = await Note.create({
		title,
		content,
		user: user_id,
	});

	return res
		.status(200)
		.json(new ApiSuccessResponse(true, 200, "Note created", note));
});

export const getNote = asyncHandler(async (req: Request, res: Response) => {
	const { noteId } = req.params;
    const user_id = req.user?._id

	const note = await Note.findOne({_id: noteId, user: user_id}).populate("user");

	if (!note) {
		throw new ApiErrorResponse(404, "Note not found");
	}

	return res
		.status(400)
		.json(
			new ApiSuccessResponse(
				true,
				400,
				"Note retrieved successfully",
				note,
			),
		);
});

export const getNotes = asyncHandler(async (req: Request, res: Response) => {
	const user_id = req.user?._id;

	const notes = await Note.find({ user: user_id }).populate("user");

	if (!notes) {
		throw new ApiErrorResponse(
			404,
			"User either have no notes or there is problem while fetching",
		);
	}

	return res
		.status(200)
		.json(
			new ApiSuccessResponse(true, 200, "Notes are fetched successfully"),
		);
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
	const { title, content } = req.body;
	const { noteId } = req.params;
    const user_id = req.user?._id

	const updatedNote = await Note.findOneAndUpdate(
        {_id: noteId, user: user_id},
        {title, content},
        {new: true}
    );

	if (!updatedNote) {
		throw new ApiErrorResponse(404, "Unable to update the note");
	}

	return res
		.status(200)
		.json(
			new ApiSuccessResponse(
				true,
				200,
				"note updated successfully",
				updatedNote,
			),
		);
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
	const { noteId } = req.params;
    const user_id = req.user?._id

	const deletedNote = await Note.findOneAndDelete({_id: noteId, user: user_id});

	if (!deletedNote) {
		throw new ApiErrorResponse(404, "Unable to delete the note");
	}

	return res
		.status(200)
		.json(
			new ApiSuccessResponse(
				true,
				200,
				"Note deleted successfully",
				deletedNote,
			),
		);
});

export const archiveNote = asyncHandler(async (req: Request, res: Response) => {
	const { noteId } = req.params;
	const isArchive = req.body;
    const user_id = req.user?._id

	const note = await Note.findOne({_id: noteId, user: user_id}).populate("user");

	if (!note) {
		throw new ApiErrorResponse(404, "Invalid not id");
	}

	note.isArchived = isArchive;
	await note.save();

	return res
		.status(200)
		.json(
			new ApiSuccessResponse(
				true,
				200,
				"Note is archived successfully",
				note,
			),
		);
});

export const pinNote = asyncHandler(async (req: Request, res: Response) => {
	const { noteId } = req.params;
	const isPin = req.body;
	const user_id = req.user?._id;

	const note = await Note.findOne({ _id: noteId, user: user_id }).populate(
		"user",
	);

	if (!note) {
		throw new ApiErrorResponse(404, "Invalid not id");
	}

	note.isPinned = isPin;
	await note.save();

	return res
		.status(200)
		.json(
			new ApiSuccessResponse(
				true,
				200,
				"Note is pinned successfully",
				note,
			),
		);
});

export const searchNote = asyncHandler(async (req: Request, res: Response) => {
	const { search } = req.query;
	const user_id = req.user?._id;

	const results = await Note.find(
		{
			user: user_id,
			$text: { $search: search as string },
		},
		{
			score: { $meta: "textScore" },
		},
	).sort({
		score: { $meta: "textScore" },
	});

	if (!results) {
		throw new ApiErrorResponse(200, "search failed");
	}

	return res
		.status(200)
		.json(
			new ApiSuccessResponse(true, 200, "Searching successful", results),
		);
});
