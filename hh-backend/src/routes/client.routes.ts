import { Router } from "express";
import {
    createClient,
    getAllClients,
    getAllUnhousedClients,
    getClient,
    putClient
} from "../controllers/client/client.controller";
import {createEvent, getUpcomingEventsForClient} from "../controllers/client/clientEvent.controller";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateToken, getAllClients)
router.post("/", authenticateToken, requirePositions("ADMIN"),  createClient);
router.get("/no-house", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), getAllUnhousedClients);

router.get("/:clientId", authenticateToken, getClient);
router.put("/:clientId", authenticateToken, requirePositions("ADMIN"), putClient);

router.post("/:clientId/event", authenticateToken, requirePositions("ADMIN", "DIRECTOR", "MANAGER"), createEvent);
router.get("/:clientId/event/upcoming", authenticateToken, getUpcomingEventsForClient);
export default router;