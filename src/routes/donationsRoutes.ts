import { Router } from "express";
import * as donationsController from "../controllers/donationsController";
import { auth } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", auth, asyncHandler(donationsController.create));
router.get("/", auth, asyncHandler(donationsController.list));
router.get("/:id", auth, asyncHandler(donationsController.getById));
router.patch(
  "/:id/status",
  auth,
  requireRole("PROFESSIONAL", "ADMIN"),
  asyncHandler(donationsController.updateStatus)
);
router.put("/:id", auth, requireRole("ADMIN"), asyncHandler(donationsController.edit));
router.delete("/:id", auth, asyncHandler(donationsController.remove));

export default router;
