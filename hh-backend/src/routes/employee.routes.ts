import { Router } from "express";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";
import {getAllEmployees} from "../controllers/employee.controller";

const router = Router();

router.get("/", authenticateToken, requirePositions("ADMIN"), getAllEmployees);


export default router;