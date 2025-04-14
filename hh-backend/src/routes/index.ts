import { Router } from "express";
import authRoutes from "./auth.routes";


const router = Router();

// Define route prefixes
router.use("/auth", authRoutes);

export default router;
