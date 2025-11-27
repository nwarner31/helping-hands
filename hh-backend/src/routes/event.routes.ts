import { Router } from "express";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";

import {getEvent} from "../controllers/event.controller";
import {putEvent} from "../controllers/event.controller";

const router = Router();

router.get("/:eventId", authenticateToken, getEvent);
router.put("/:eventId", authenticateToken, requirePositions("ADMIN", "DIRECTOR", "MANAGER"), putEvent);

export default router;