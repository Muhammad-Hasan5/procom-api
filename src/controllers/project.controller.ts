import { Project } from "../models/projects.model.js";
import { User } from "../models/users.model.js";
import { Note } from "../models/notes.model.js";
import { ApiErrorResponse } from "../utils/api-error-response.js";
import { ApiSuccessResponse } from "../utils/api-success-response.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { Types } from "mongoose";
import { ProjectDocument } from "../types/ProjectsModel.types.js";

export const createProject = asyncHandler(
	async (req: Request, res: Response) => {
		const { title, description } = req.body;
		if (!title) {
			throw new ApiErrorResponse(400, "Title is required");
		}

		if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
			throw new ApiErrorResponse(400, "Invalid user ID");
		}

		const project = await Project.create({
			title,
			description,
			owner: req.user._id,
		});

		await project.save();

		return res
			.status(201)
			.json(
				new ApiSuccessResponse<ProjectDocument>(
					true,
					201,
					"Project created successfully",
					project,
				),
			);
	},
);

export const getSingleProject = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user || !Types.ObjectId.isValid(req.user._id)) {
			throw new ApiErrorResponse(400, "Invalid user ID");
		}

		if (!req.project || !Types.ObjectId.isValid(req.project._id)) {
			throw new ApiErrorResponse(400, "Invalid project ID");
		}

		res.status(200).json(
			new ApiSuccessResponse<ProjectDocument>(true, 200, "Project found", req.project),
		);
	},
);

export const getUserProjects = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
			throw new ApiErrorResponse(400, "Invalid user ID");
		}

		const userId = req.user?._id;
		const searchQuery = req.query.q as string | undefined;

		let projects;

		if (searchQuery) {
			projects = await Project.find(
				{
					owner: userId,
					$text: { $search: searchQuery },
				},
				{ score: { $meta: "textScore" } },
			).sort({ score: { $meta: "textScore" } });
		} else {
			projects = await Project.find({
				owner: userId,
			});
		}

		if (!projects) {
			throw new ApiErrorResponse(404, "Project not found");
		}

		res.status(200).json(
			new ApiSuccessResponse<ProjectDocument[]>(true, 200, "Project found", projects),
		);
	},
);

export const updateProject = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
			throw new ApiErrorResponse(400, "Invalid user ID");
		}

		if (!req.project?._id || !Types.ObjectId.isValid(req.project._id)) {
			throw new ApiErrorResponse(400, "Invalid project ID");
		}

		const userId = req.user?._id;
		const projectId = req.project?._id;

		if (req.project.owner.toString() !== userId.toString()) {
			throw new ApiErrorResponse(
				400,
				"Only owner can change project owner",
			);
		}

		const { title, description, ownerEmail, membersEmails } = req.body;

		let newOwner = req.project.owner;
		if (ownerEmail) {
			const ownerUser = await User.findOne({ email: ownerEmail });
			if (!ownerUser) {
				throw new ApiErrorResponse(
					404,
					"New Owner not founnd by given email",
				);
			}
			newOwner = ownerUser._id;
		}

		let newMembers = req.project.members;
		if (Array.isArray(membersEmails) && membersEmails.length > 0) {
			const users = await User.find({ email: { $in: membersEmails } });
			if (!users.length) {
				throw new ApiErrorResponse(
					404,
					"New members not found by provided emails",
				);
			}
			const userIds = users.map(u => u._id)
			const existingMembers = req.project?.members ?? []
			newMembers = [...new Set([...existingMembers, ...userIds])];
		}

		const updatedproject = await Project.findOneAndUpdate(
			{ _id: projectId },
			{ title, description, owner: newOwner, members: newMembers },
			{
				new: true,
			},
		).populate([{ path: "owner" }, { path: "members" }]);

		if (!updatedproject) {
			throw new ApiErrorResponse(400, "unable to update the project");
		}

		res.status(200).json(
			new ApiSuccessResponse<ProjectDocument>(
				true,
				200,
				"Project updated successfully",
				updatedproject,
			),
		);
	},
);

export const deleteProject = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
			throw new ApiErrorResponse(400, "Invalid user ID");
		}
		if (!req.project?._id || !Types.ObjectId.isValid(req.project._id)) {
			throw new ApiErrorResponse(400, "Invalid project ID");
		}
		const userId = req.user?._id;
		const projectId = req.project?._id;

		if (req.project.owner.toString() !== userId.toString()) {
			throw new ApiErrorResponse(
				400,
				"Only owner can delete the project",
			);
		}

		const deletedProject = await Project.findOneAndDelete({
			_id: projectId,
			owner: userId,
		});

		if (!deletedProject) {
			throw new ApiErrorResponse(
				404,
				"Project not found or you're not authorized to delete it",
			);
		}

		const deletedProjectNotes = await Note.deleteMany({
			project: deletedProject._id,
		});

		if (!deletedProjectNotes) {
			throw new ApiErrorResponse(
				404,
				"project have no notes or error deleting",
			);
		}

		res.status(200).json(
			new ApiSuccessResponse<object>(true, 200, "Project deleted successfully", {
				deletedProject,
				deletedProjectNotes,
			}),
		);
	},
);

export const addMemberToProject = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
			throw new ApiErrorResponse(400, "Invalid user ID");
		}
		if (!req.project?._id || !Types.ObjectId.isValid(req.project._id)) {
			throw new ApiErrorResponse(400, "Invalid project ID");
		}
		const userId = req.user?._id;
		const project = req.project;
		const { memberEmail } = req.body;

		if (project.owner.toString() !== userId.toString()) {
			throw new ApiErrorResponse(
				400,
				"Only owner can add members the project",
			);
		}

		if (!memberEmail) {
			throw new ApiErrorResponse(400, "Member email is required");
		}

		const memberUser = await User.findOne({ email: memberEmail });

		if (!memberUser) {
			throw new ApiErrorResponse(404, "Member not found by given email");
		}

		if (project.members?.includes(memberUser._id)) {
			throw new ApiErrorResponse(
				400,
				"User is already a member of the project",
			);
		}

		project.members?.push(memberUser._id);
		await project.save();

		await project.populate([{ path: "owner" }, { path: "members" }]);

		res.status(200).json(
			new ApiSuccessResponse<ProjectDocument>(
				true,
				200,
				"Member added to project successfully",
				project,
			),
		);
	},
);

export const removeMemberFromProject = asyncHandler(
	async (req: Request, res: Response) => {
		if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
			throw new ApiErrorResponse(400, "Invalid user ID");
		}

		if (!req.project?._id || !Types.ObjectId.isValid(req.project._id)) {
			throw new ApiErrorResponse(400, "Invalid project ID");
		}

		const userId = req.user?._id;
		const project = req.project;
		const { memberEmail } = req.body;

		if (project.owner.toString() !== userId.toString()) {
			throw new ApiErrorResponse(
				400,
				"Only owner can remove members from the project",
			);
		}

		if (!memberEmail) {
			throw new ApiErrorResponse(400, "Member email is required");
		}

		const memberUser = await User.findOne({ email: memberEmail });

		if (!memberUser) {
			throw new ApiErrorResponse(404, "Member not found by given email");
		}

		if (!project.members?.includes(memberUser._id)) {
			throw new ApiErrorResponse(
				400,
				"User is not a member of the project",
			);
		}

		project.members = project.members?.filter(
			(memberId) => memberId.toString() !== memberUser._id.toString(),
		);

		await project.save();
		await project.populate([{ path: "owner" }, { path: "members" }]);

		res.status(200).json(
			new ApiSuccessResponse(
				true,
				200,
				"Member removed from project successfully",
				project,
			),
		);
	},
);
