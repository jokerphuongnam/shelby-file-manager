import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import fileRoutes from "./routes/fileRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", environment: config.nodeEnv });
});

app.use("/", fileRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(
    `[Server] Running on http://localhost:${config.port} (${config.nodeEnv})`
  );
});

export default app;
