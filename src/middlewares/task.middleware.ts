import { Task } from "../models/tasks.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiErrorResponse } from "../utils/api-error-response.js";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

export const canAccessTask = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		if (!Types.ObjectId.isValid(req.params.taskId)) {
			throw new ApiErrorResponse(404, "invalid task ID");
		}

		const task = await Task.findById(req.params.taskId);

		if (!task) {
			throw new ApiErrorResponse(404, "Task not found");
		}

		if (!task.project?.equals(req.project?._id)) {
			throw new ApiErrorResponse(403, "task not belong to this project");
		}

		req.task = task;
		next();
	},
);
