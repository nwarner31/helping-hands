import app from "./app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, async () => {
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
