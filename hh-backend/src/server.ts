import app from "./app";
import { PrismaClient } from "@prisma/client";
import "./jobs/token.job";
import {logger} from "./utility/logger";

const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
});
const PORT = process.env.PORT || 5000;


// Start the server
const server = app.listen(PORT, async () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);

    // Test database connection
    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
});

const shutdown = () => {
    console.log("Shutting down server...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
};

process.on("SIGINT", shutdown);  // Ctrl+C
process.on("SIGTERM", shutdown); // Nodemon restarts

