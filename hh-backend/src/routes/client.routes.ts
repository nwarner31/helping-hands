import { Router } from "express";
import {createClient, getAllClients} from "../controllers/client.controller";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateToken, getAllClients)
router.post("/", authenticateToken, requirePositions("ADMIN"),  createClient);


export default router;