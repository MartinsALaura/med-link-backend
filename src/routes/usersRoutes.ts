import { Router } from "express";
import * as usersController from "../controllers/usersController";
import { auth } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", auth, requireRole("ADMIN"), asyncHandler(usersController.list));
router.get("/:id", auth, asyncHandler(usersController.getById));
router.put("/:id", auth, asyncHandler(usersController.update));
router.patch("/:id/password", auth, asyncHandler(usersController.changePassword));
router.patch(
  "/:id/status",
  auth,
  requireRole("ADMIN"),
  asyncHandler(usersController.setStatus)
);
router.patch(
  "/:id/partner",
  auth,
  requireRole("ADMIN"),
  asyncHandler(usersController.setPartner)
);

export default router;
