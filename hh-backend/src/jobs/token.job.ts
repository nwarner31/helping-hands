import cron from "node-cron";
import { cleanupOldTokens } from "../services/utility/token.service";

// Runs once every day at 2:00 AM server time
cron.schedule("0 2 * * *", async () => {
    console.log("🧹 Running daily token cleanup...");
    try {
        await cleanupOldTokens();
        console.log("✅ Token cleanup completed successfully");
    } catch (err) {
        console.error("❌ Token cleanup failed:", err);
    }
});
