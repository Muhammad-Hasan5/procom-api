import mongoose, { Schema, Types } from "mongoose";
import { IProjectDocument, IProjectModel } from "../types/ProjectsModel.types.js";

const projectSchema = new Schema<IProjectDocument>(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		owner: {
			type: Types.ObjectId,
			ref: "User",
			required: true,
		},
		members: [{ type: Types.ObjectId, ref: "User", default: [] }],
	},
	{
		timestamps: true,
	},
);

export const Project = mongoose.model<IProjectDocument, IProjectModel>(
	"Project",
	projectSchema,
);
