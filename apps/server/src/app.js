import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createTranscriptRouter } from "./routes/transcripts.js";

export function createApp(options = {}) {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
  app.use(express.json());
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/transcripts", createTranscriptRouter(options));

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "An unexpected error occurred." });
  });

  return app;
}
