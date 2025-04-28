import { Router } from "express";
import {createClient, getAllClients, getClient, putClient} from "../controllers/client.controller";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateToken, getAllClients)
router.post("/", authenticateToken, requirePositions("ADMIN"),  createClient);
router.get("/:clientId", getClient);
router.put("/:clientId", authenticateToken, requirePositions("ADMIN"), putClient);


export default router;