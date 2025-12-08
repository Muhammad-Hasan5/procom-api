import mongoose, { Schema, Types } from "mongoose";
export const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    project: {
        type: Types.ObjectId,
        ref: "Project",
        required: true,
    },
    assignedTo: {
        type: Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["todo", "in-progress", "review", "done"],
        default: "todo",
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
export const Task = mongoose.model("Task", taskSchema);
