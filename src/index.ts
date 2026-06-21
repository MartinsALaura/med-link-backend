import express from "express";
import cors from "cors";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Allow the Ionic/Angular frontend (dev server) to call the API from the browser.
app.use(cors());
// Larger limit because files (photos, PDFs) arrive as base64 in the JSON body.
app.use(express.json({ limit: "100mb" }));
app.use("/api", routes);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port} [${env.nodeEnv}]`);
});
