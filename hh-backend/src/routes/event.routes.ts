import { Router } from "express";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";

import {getEvent} from "../controllers/event.controller";

const router = Router();

router.get("/:eventId", authenticateToken, getEvent);

export default router;