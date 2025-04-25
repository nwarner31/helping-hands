import { Router } from "express";
import {createClient} from "../controllers/client.controller";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticateToken, requirePositions("ADMIN"),  createClient);


export default router;