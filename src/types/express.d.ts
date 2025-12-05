import { NoteDocument } from "./NotesModel.types.ts";
import { ProjectDocument } from "./ProjectsModel.types.ts";
import { TaskDocument } from "./TasksModel.types.ts";
import { UserDocument } from "./UserModel.types.ts";

declare global {
	namespace Express {
		interface Request {
			user?: UserDocument;
			project?: ProjectDocument;
			note?: NoteDocument;
			task?: TaskDocument;
		}
	}
}
