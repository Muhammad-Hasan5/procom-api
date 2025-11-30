import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./db/index.db.js";
dotenv.config({
    path: "./.env",
});
let port = process.env.PORT;
connectDB()
    .then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.error("Something went wrong with Database", error);
});
