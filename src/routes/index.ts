import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "../docs/openapi";
import authRoutes from "./authRoutes";
import usersRoutes from "./usersRoutes";
import donationsRoutes from "./donationsRoutes";
import partnersRoutes from "./partnersRoutes";
import requestsRoutes from "./requestsRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Interactive API docs (Swagger UI) and the raw OpenAPI spec.
router.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
router.get("/openapi.json", (_req, res) => {
  res.json(openapiSpec);
});

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/donations", donationsRoutes);
router.use("/partners", partnersRoutes);
router.use("/requests", requestsRoutes);

export default router;
