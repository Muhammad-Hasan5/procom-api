import { UserDocument } from "./UserModel.types.ts";

declare global {
	namespace Express {
		interface Request {
			user?: UserDocument;
		}
	}
}