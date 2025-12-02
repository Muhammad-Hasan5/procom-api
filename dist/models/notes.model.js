import mongoose, { Schema } from "mongoose";
const notesSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
export const Notes = mongoose.model("Notes", notesSchema);
