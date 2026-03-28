import { Router } from "express";
import authRoutes from "./auth.routes";
import clientRoutes from "./client.routes";
import houseRoutes from "./house.routes";
import eventRoutes from "./event.routes";
import employeeRoutes from "./employee.routes";

const router = Router();

// Define route prefixes
router.use("/auth", authRoutes);
router.use("/client", clientRoutes);
router.use("/house", houseRoutes);
router.use("/event", eventRoutes);
router.use("/employee", employeeRoutes);

export default router;
