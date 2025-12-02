import mongoose, {Schema} from "mongoose";
import { INotes, INotesModel } from "../types/NotesModel.js";

const notesSchema = new Schema<INotes, INotesModel>(
	{
		title: {
			type: String,
            required: true,
		},
		description: {
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
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

export const Notes = mongoose.model<INotes, INotesModel>("Notes", notesSchema)