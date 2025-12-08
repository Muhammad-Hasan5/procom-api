import { Task } from "../models/tasks.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiErrorResponse } from "../utils/api-error-response.js";
import { ApiSuccessResponse } from "../utils/api-success-response.js";
import { Types } from "mongoose";
import { User } from "../models/users.model.js";
export const createTask = asyncHandler(async (req, res) => {
    if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
        throw new ApiErrorResponse(400, "Invalid user ID");
    }
    if (!req.project?._id || !Types.ObjectId.isValid(req.project._id)) {
        throw new ApiErrorResponse(400, "Invalid project ID");
    }
    const userId = req.user?._id;
    const project = req.project;
    if (userId.toString() !== project.owner.toString()) {
        throw new ApiErrorResponse(403, "Only owner can create tasks");
    }
    const { title, description, status, assignedTo } = req.body;
    if (!title) {
        throw new ApiErrorResponse(400, "title is required");
    }
    if (!status) {
        throw new ApiErrorResponse(400, "status is required");
    }
    let assignedUser;
    if (assignedTo) {
        assignedUser = await User.findOne({ email: assignedTo });
        if (!assignedUser) {
            throw new ApiErrorResponse(404, "Assigned User not found");
        }
        const isUserInProject = project.owner.equals(assignedUser?._id) ||
            project.members?.includes(assignedUser?._id);
        if (!isUserInProject) {
            throw new ApiErrorResponse(403, "assigned user is not a member of this project");
        }
    }
    const allowedStatuses = ["todo", "in-progress", "review", "done"];
    if (!allowedStatuses.includes(status)) {
        throw new ApiErrorResponse(400, "status is invalid");
    }
    const task = await Task.create({
        title,
        description,
        project: project._id,
        status,
        assignedTo: assignedUser._id,
        createdBy: userId,
    });
    if (!task) {
        throw new ApiErrorResponse(400, `Error creating new Task => ${task}`);
    }
    res.status(201).json(new ApiSuccessResponse(true, 201, "Task created successfully", task));
});
export const getProjectTasks = asyncHandler(async (req, res) => {
    if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
        throw new ApiErrorResponse(400, "Invalid user ID");
    }
    if (!req.project?._id || !Types.ObjectId.isValid(req.project._id)) {
        throw new ApiErrorResponse(400, "Invalid project ID");
    }
    const project = req.project;
    const tasks = await Task.find({ project: project._id }).populate([
        { path: "assignedTo" },
        { path: "project" },
        { path: "createdBy" },
    ]);
    if (!tasks.length) {
        throw new ApiErrorResponse(400, "prject has no tasks or error fetching tasks");
    }
    res.status(200).json(new ApiSuccessResponse(true, 200, "All project tasks fetched", tasks));
});
export const getUserTasks = asyncHandler(async (req, res) => {
    if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
        throw new ApiErrorResponse(400, "Invalid user ID");
    }
    if (!req.project?._id || !Types.ObjectId.isValid(req.project._id)) {
        throw new ApiErrorResponse(400, "Invalid project ID");
    }
    const userId = req.user._id;
    const project = req.project;
    const isUserInProject = project.owner.toString() === userId.toString() ||
        project.members?.some((m) => m.toString() === userId.toString());
    if (!isUserInProject) {
        throw new ApiErrorResponse(403, "user is not in this project");
    }
    const userTasks = await Task.find({
        assignedTo: userId,
        project: project._id,
    });
    if (!userTasks.length) {
        throw new ApiErrorResponse(404, "Either user have no task or error fetching");
    }
    res.status(200).json(new ApiSuccessResponse(true, 200, "Users tasks in this project are fetched", userTasks));
});
export const getTask = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiSuccessResponse(true, 200, "task fetched", req.task));
});
export const updateTask = asyncHandler(async (req, res) => {
    if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
        throw new ApiErrorResponse(400, "Invalid user ID");
    }
    if (!req.project?._id || !Types.ObjectId.isValid(req.project._id)) {
        throw new ApiErrorResponse(400, "Invalid project ID");
    }
    if (!req.task?._id || !Types.ObjectId.isValid(req.task._id)) {
        throw new ApiErrorResponse(400, "Invalid task ID");
    }
    const userId = req.user?._id;
    const project = req.project;
    const taskId = req.task?._id;
    if (userId.toString() !== project.owner.toString()) {
        throw new ApiErrorResponse(403, "Only owner can update tasks");
    }
    const { title, description, status, assignedTo } = req.body;
    if (!title || !status) {
        throw new ApiErrorResponse(400, "title, status is required");
    }
    let assignedUser;
    if (assignedTo) {
        assignedUser = await User.findOne({ email: assignedTo });
        if (!assignedUser) {
            throw new ApiErrorResponse(404, "Assigned User not found");
        }
        const isUserInProject = project.owner.equals(assignedUser?._id) ||
            project.members?.includes(assignedUser?._id);
        if (!isUserInProject) {
            throw new ApiErrorResponse(403, "assigned user is not a member of this project");
        }
    }
    const allowedStatuses = ["todo", "in-progress", "review", "done"];
    if (!allowedStatuses.includes(status)) {
        throw new ApiErrorResponse(400, "status is invalid");
    }
    const updatedTask = await Task.findOneAndUpdate({ _id: taskId, project: project._id }, {
        title,
        description,
        project: project._id,
        status,
        assignedTo: assignedUser._id,
        createdBy: userId,
    }, {
        new: true,
    });
    if (!updatedTask) {
        throw new ApiErrorResponse(400, "error updating task");
    }
    res.status(201).json(new ApiSuccessResponse(true, 201, "Task created successfully", updatedTask));
});
export const changeTaskStatus = asyncHandler(async (req, res) => {
    if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
        throw new ApiErrorResponse(400, "Invalid user ID");
    }
    if (!req.project?._id || !Types.ObjectId.isValid(req.project._id)) {
        throw new ApiErrorResponse(400, "Invalid project ID");
    }
    if (!req.task?._id || !Types.ObjectId.isValid(req.task._id)) {
        throw new ApiErrorResponse(400, "Invalid task ID");
    }
    const userId = req.user._id;
    const project = req.project;
    const taskId = req.task._id;
    const { newStatus } = req.body;
    if (userId.toString() !== project.owner.toString()) {
        throw new ApiErrorResponse(403, "Only project owner can change task status");
    }
    const allowedStatuses = ["todo", "in-progress", "review", "done"];
    if (!allowedStatuses.includes(newStatus)) {
        throw new ApiErrorResponse(400, "invalid status");
    }
    const updatedStatusTask = await Task.findOneAndUpdate({ _id: taskId, project: project._id }, { status: newStatus }, { new: true });
    if (!updatedStatusTask) {
        throw new ApiErrorResponse(400, "Error updating the status");
    }
    res.status(200).json(new ApiSuccessResponse(true, 200, "task's status change successfully", updatedStatusTask));
});
export const deleteTask = asyncHandler(async (req, res) => {
    if (!req.user?._id || !Types.ObjectId.isValid(req.user._id)) {
        throw new ApiErrorResponse(400, "Invalid user ID");
    }
    if (!req.project?._id || !Types.ObjectId.isValid(req.project._id)) {
        throw new ApiErrorResponse(400, "Invalid project ID");
    }
    if (!req.task?._id || !Types.ObjectId.isValid(req.task._id)) {
        throw new ApiErrorResponse(400, "Invalid task ID");
    }
    const taskId = req.task._id;
    const project = req.project;
    const userId = req.user._id;
    if (userId.toString() !== project.owner.toString()) {
        throw new ApiErrorResponse(403, "only owner can delete task");
    }
    const deletedTask = await Task.findOneAndDelete({
        _id: taskId,
        project: project._id,
    });
    if (!deletedTask) {
        throw new ApiErrorResponse(400, "Unable to delete task");
    }
    res.status(200).json(new ApiSuccessResponse(true, 200, "task deleted successfully", deletedTask));
});
