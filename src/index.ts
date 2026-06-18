import express from "express";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

// Larger limit because files (photos, PDFs) arrive as base64 in the JSON body.
app.use(express.json({ limit: "100ssmb" }));
app.use("/api", routes);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port} [${env.nodeEnv}]`);
});
