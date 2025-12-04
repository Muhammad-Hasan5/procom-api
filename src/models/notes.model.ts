import mongoose, { Schema, Types } from "mongoose";
import { INoteDocument, INoteModel } from "../types/NotesModel.types.js";

const notesSchema = new Schema<INoteDocument>(
	{
		title: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			default: "",
		},
		isArchived: {
			type: Boolean,
			default: false,
		},
		isPinned: {
			type: Boolean,
			default: false,
		},
		user: {
			type: Types.ObjectId,
			ref: "User",
			required: true,
		},
		project: {
			type: Types.ObjectId,
			ref: "Project",
			required: true
		},
	},
	{
		timestamps: true,
	},
);

notesSchema.index({
	title: "text",
	content: "text",
});

export const Note = mongoose.model<INoteDocument, INoteModel>(
	"Note",
	notesSchema,
);
