import { Router } from "express";
import * as authController from "../controllers/authController";
import { auth } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.get("/me", auth, asyncHandler(authController.me));

export default router;
