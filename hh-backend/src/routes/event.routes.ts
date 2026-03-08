import { Router } from "express";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";

import {getEvent, recordAction} from "../controllers/event.controller";
import {putEvent} from "../controllers/event.controller";

const router = Router();

router.get("/:eventId", authenticateToken, getEvent);
router.put("/:eventId", authenticateToken, requirePositions("ADMIN", "DIRECTOR", "MANAGER"), putEvent);
router.post("/:eventId/record-action", authenticateToken, requirePositions("ADMIN", "DIRECTOR", "MANAGER"), recordAction);

export default router;