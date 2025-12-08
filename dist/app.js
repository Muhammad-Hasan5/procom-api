import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
// Basic Configurations:
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb",
}));
//app.use(express.static("public"))
// CORS Configurations:
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:8000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
//using cookie-parser
app.use(cookieParser());
// Routes:
import healthcheck_Router from "./routes/healthcheck.route.js";
import auth_Router from "./routes/auth.route.js";
import notes_Router from "./routes/notes.route.js";
import project_Router from "./routes/project.route.js";
import task_Router from "./routes/tasks.route.js";
app.use("/api/v1/healthcheck", healthcheck_Router);
app.use("/api/v1/auth", auth_Router);
app.use("/api/v1", notes_Router);
app.use("/api/v1", project_Router);
app.use("/api/v1", task_Router);
app.get("/", (req, res) => {
    res.send("welcome to Notion-Lite");
});
export default app;
