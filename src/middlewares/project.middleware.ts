import { Project } from "../models/projects.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiErrorResponse } from "../utils/api-error-response.js";
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

export const canAccessProject = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
        if(!Types.ObjectId.isValid(req.params.projectId)){
            throw new ApiErrorResponse(404, "Invalid project ID")
        }

		const project = await Project.findById(req.params.projectId);

		if (!project) {
			throw new ApiErrorResponse(404, "Project not found");
		}

		const userId = req.user?._id;

		const isMember =
			project.owner.equals(userId) ||
			project.members?.some((m) => m.equals(userId));

		if (!isMember) {
			throw new ApiErrorResponse(403, "Unauthorized user");
		}

		req.project = project;
		next();
	},
);
