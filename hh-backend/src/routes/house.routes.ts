import { Router } from "express";
import { createClient } from "../controllers/client.controller";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";
import {createHouse, getAllHouses} from "../controllers/house.controller";


const router = Router();

router.post("/", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), createHouse);
router.get("/", authenticateToken, getAllHouses);

export default router;