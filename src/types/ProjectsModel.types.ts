import { Model, Document, Types } from "mongoose";

export interface IProject {
	title: string;
	description?: string;
	owner: Types.ObjectId;
	members?: Types.ObjectId[];
}

export interface IProjectDocument extends IProject, Document {
	createdAt: Date;
	updatedAt: Date;
}

export interface IProjectModel extends Model<IProjectDocument> {}

export type ProjectDocument = Document<Types.ObjectId> & IProject
