import { Router } from "express";
import {
	createTask,
	getProjectTasks,
	getUserTasks,
	getTask,
	updateTask,
	deleteTask,
	changeTaskStatus,
} from "../controllers/tasks.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validators.middleware.js";
import { taskValidator } from "../validators/tasks.validator.js";
import { canAccessProject } from "../middlewares/project.middleware.js";
import { canAccessTask } from "../middlewares/task.middleware.js";

const router = Router({ mergeParams: true });

router
	.route("/projects/:projectId/tasks")
	.post(
		authMiddleware,
		canAccessProject,
		taskValidator(),
		validate,
		createTask,
	)
	.get(authMiddleware, canAccessProject, getProjectTasks)
	.get(authMiddleware, canAccessProject, canAccessTask, getUserTasks);

router
	.route("/projects/:projectId/tasks/:taskId")
	.get(authMiddleware, canAccessProject, canAccessTask, getTask)
	.patch(
		authMiddleware,
		canAccessProject,
		canAccessTask,
		taskValidator(),
		validate,
		updateTask,
	)
	.delete(authMiddleware, canAccessProject, canAccessTask, deleteTask);

router
	.route("/projects/:projectId/tasks/:taskId/status")
	.patch(authMiddleware, canAccessProject, canAccessTask, changeTaskStatus);

export default router;
