import mongoose, { Schema, Types } from "mongoose";
import { ITaskDocument, ITaskModel } from "../types/TasksModel.types.js";

export const taskSchema = new Schema<ITaskDocument>(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: "",
		},
		project: {
			type: Types.ObjectId,
			ref: "Project",
			required: true,
		},
		assignedTo: {
			type: Types.ObjectId,
			ref: "User",
		},
		status: {
			type: String,
			enum: ["todo", "in-progress", "review", "done"],
			default: "todo",
		},
		createdBy: {
			type: Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

export const Task = mongoose.model<ITaskDocument, ITaskModel>(
	"Task",
	taskSchema,
);
