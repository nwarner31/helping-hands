import { Router } from "express";
import {authenticateToken, requirePositions} from "../middlewares/auth.middleware";
import {
    addClientToHouse,
    addManagerToHouse,
    createHouse,
    getAllHouses, getAvailableManagersForHouse,
    getHouse,
    putHouse,
    removeClientFromHouse, removeManagerFromHouse
} from "../controllers/house.controller";


const router = Router();

router.post("/", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), createHouse);
router.get("/", authenticateToken, getAllHouses);
router.put("/:houseId", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), putHouse);
router.get("/:houseId", authenticateToken, getHouse);
router.patch("/:houseId/clients", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), addClientToHouse);
router.delete("/:houseId/clients/:clientId", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), removeClientFromHouse);
router.get("/:houseId/available-managers", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), getAvailableManagersForHouse);
router.post("/:houseId/manager", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), addManagerToHouse);
router.delete("/:houseId/manager/:managerId", authenticateToken, requirePositions("ADMIN", "DIRECTOR"), removeManagerFromHouse);

export default router;