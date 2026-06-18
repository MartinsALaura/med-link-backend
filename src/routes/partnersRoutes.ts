import { Router } from "express";
import * as partnersController from "../controllers/partnersController";
import { auth } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Public registration — partner enters with status "pendente".
router.post("/", asyncHandler(partnersController.create));
router.get("/", auth, asyncHandler(partnersController.list));
router.get("/:id", auth, asyncHandler(partnersController.getById));

export default router;
