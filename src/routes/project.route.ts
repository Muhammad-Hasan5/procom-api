import { Router } from "express";
import {
	createProject,
	updateProject,
	deleteProject,
	getSingleProject,
	getUserProjects,
	addMemberToProject,
	removeMemberFromProject,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { projectValidator } from "../validators/project.validator.js";
import { validate } from "../middlewares/validators.middleware.js";
import { canAccessProject } from "../middlewares/project.middleware.js";

const router = Router();

// Create & get all projects of logged-in user
router
	.route("/projects")
	.post(authMiddleware, projectValidator(),validate, createProject)
	.get(authMiddleware, getUserProjects);

// Get, update, delete one project
router
	.route("/projects/:projectId")
	.get(authMiddleware, canAccessProject, getSingleProject)
	.patch(
		authMiddleware,
		canAccessProject,
		projectValidator(),
		validate,
		updateProject,
	)
	.delete(authMiddleware, canAccessProject, deleteProject);

// Manage project members
router
	.route("/projects/:projectId/members")
	.post(authMiddleware, canAccessProject, addMemberToProject);

router
	.route("/projects/:projectId/members/:memberId")
	.delete(authMiddleware, canAccessProject, removeMemberFromProject);

export default router;
