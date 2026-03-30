import { Router } from "express";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";
import {getAllEmployees, getEmployee, updateEmployee} from "../controllers/employee.controller";

const router = Router();

router.get("/", authenticateToken, requirePositions("ADMIN"), getAllEmployees);
router.get("/:employeeId", authenticateToken, requirePositions("ADMIN"), getEmployee);
router.put("/:employeeId", authenticateToken, requirePositions("ADMIN"), updateEmployee);


export default router;