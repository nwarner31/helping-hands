import { Router } from "express";
import {
    createClient,
    getAllClients,
    getAllUnhousedClients,
    getClient,
    putClient
} from "../controllers/client/client.controller";
import {
    checkForClientEventConflicts,
    createEvent, getClientEventConflictData,
    getEventsForClient,
    getUpcomingEventsForClient
} from "../controllers/client/clientEvent.controller";
import {authenticateToken, requirePositions, withAuth} from "../middlewares/auth.middleware";
import {loggerMiddleware} from "../middlewares/requestLogger.middleware";

const router = Router();

router.get("/", authenticateToken, getAllClients)
router.post("/", authenticateToken, requirePositions("ADMIN"), loggerMiddleware,  createClient);
router.get("/no-house", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), getAllUnhousedClients);

router.get("/:clientId", authenticateToken, withAuth(getClient));
router.put("/:clientId", authenticateToken, requirePositions("ADMIN"), loggerMiddleware, putClient);

router.post("/:clientId/event", authenticateToken, requirePositions("ADMIN", "DIRECTOR", "MANAGER"), loggerMiddleware, createEvent);
router.get("/:clientId/event", authenticateToken, getEventsForClient);
router.get("/:clientId/event/upcoming", authenticateToken, getUpcomingEventsForClient);
router.get("/:clientId/event/has-conflicts", authenticateToken, requirePositions("ADMIN", "DIRECTOR", "MANAGER"), checkForClientEventConflicts);
router.get("/:clientId/event/get-conflicts", authenticateToken, requirePositions("ADMIN", "DIRECTOR", "MANAGER"), getClientEventConflictData);
export default router;