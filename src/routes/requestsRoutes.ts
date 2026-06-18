import { Router } from "express";
import * as requestsController from "../controllers/requestsController";
import { auth } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", auth, asyncHandler(requestsController.create));
router.get("/", auth, asyncHandler(requestsController.list));
router.get("/:id", auth, asyncHandler(requestsController.getById));
router.patch(
  "/:id/status",
  auth,
  requireRole("PROFESSIONAL", "ADMIN"),
  asyncHandler(requestsController.updateStatus)
);
router.delete("/:id", auth, asyncHandler(requestsController.cancel));

export default router;
