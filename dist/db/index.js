import mongoose from "mongoose";
export const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("❌ MONGO_URI is missing in environment variables");
    }
    // Register connection event listeners (once)
    mongoose.connection.on("connected", () => console.log("✅ Database connected"));
    mongoose.connection.on("disconnected", () => console.log("❌ Disconnected"));
    mongoose.connection.on("reconnected", () => console.log("🔄 Reconnected"));
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("🚀 Database connection successful");
    }
    catch (error) {
        console.error("❌ Error connecting to Database:", error);
        process.exit(1);
    }
};
