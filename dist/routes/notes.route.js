import { Router } from "express";
import { createNote, updateNote, getNote, getNotes, deleteNote, archiveNote, pinNote, searchNote, } from "../controllers/notes.controller.js";
import { validate } from "../middlewares/validators.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { notesValidator } from "../validators/notes.validator.js";
const router = Router();
router
    .route("/notes")
    .post(authMiddleware, notesValidator(), validate, createNote);
router.route("/notes/:noteId").get(authMiddleware, getNote);
router.route("/notes").get(authMiddleware, getNotes);
router
    .route("/notes/:noteId")
    .patch(authMiddleware, notesValidator(), validate, updateNote);
router.route("/notes/:noteId").delete(authMiddleware, deleteNote);
router.route("/notes/:noteId/archive").patch(authMiddleware, archiveNote);
router.route("/notes/:noteId/pin").patch(authMiddleware, pinNote);
router.route("/notes/:noteId/q=search").get(authMiddleware, searchNote);
export default router;
