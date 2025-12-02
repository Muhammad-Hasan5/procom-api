import mongoose, { Types } from "mongoose";
import { IUser } from "./UserModel.js";

export interface INotes {
	title: string;
	description: string;
	isArchived: boolean;
	isPinned: boolean;
	user: mongoose.Schema.Types.ObjectId | IUser;
}

export interface INotesModel extends Model<INotes, {}, {}> {}

