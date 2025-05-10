import { Router } from "express";
import { createClient } from "../controllers/client.controller";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";
import {addClientToHouse, createHouse, getAllHouses, getHouse, putHouse} from "../controllers/house.controller";


const router = Router();

router.post("/", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), createHouse);
router.get("/", authenticateToken, getAllHouses);
router.put("/:houseId", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), putHouse);
router.get("/:houseId", authenticateToken, getHouse);
router.patch("/:houseId/clients", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), addClientToHouse);

export default router;