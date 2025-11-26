import express from "express";
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
app.get("/", (req, res) => {
    res.send("welcome to Notion-Lite");
});
export default app;
