import { Router } from "express";
import authRoutes from "./auth.routes";
import clientRoutes from "./client.routes";

const router = Router();

// Define route prefixes
router.use("/auth", authRoutes);
router.use("/client", clientRoutes);

export default router;
