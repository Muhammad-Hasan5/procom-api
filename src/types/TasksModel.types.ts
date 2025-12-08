import { Document, Model, Types } from "mongoose";

export interface ITask {
	title: string;
	description?: string;
	project: Types.ObjectId;
	assignedTo?: Types.ObjectId;
	status: "todo" | "in-progress" | "review" | "done";
	createdBy: Types.ObjectId;
}

export interface ITaskDocument extends ITask, Document {
	createdAt: Date;
	updatedAt: Date;
}

export interface ITaskModel extends Model<ITaskDocument> {}

export type TaskDocument = Document<Types.ObjectId> & ITask;
