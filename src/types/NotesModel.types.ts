import { Model, Types, Document } from "mongoose";

export interface INote {
	title: string;
	content: string;
	isArchived?: boolean;
	isPinned?: boolean;
	user: Types.ObjectId;
	project: Types.ObjectId;
}

export interface INoteDocument extends INote, Document {
	createdAt: Date;
	updatedAt: Date;
}

export interface INoteModel extends Model<INoteDocument> {}

export type NoteDocument = Document<Types.ObjectId> & INote 

