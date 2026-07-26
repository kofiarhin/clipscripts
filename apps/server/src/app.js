import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { ApiError, isApiError } from "./errors.js";
import { createTranscriptRouter } from "./routes/transcripts.js";

export function createApp(options = {}) {
  const app = express();
  const environment = options.environment || process.env.NODE_ENV || "development";

  if (String(process.env.TRUST_PROXY || "0") === "1") app.set("trust proxy", 1);

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: options.clientOrigin || process.env.CLIENT_URL || "http://localhost:5173" }));
  app.use(express.json({ limit: "10kb" }));
  if (environment !== "test") app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  const enableRateLimit = options.enableRateLimit ?? environment !== "test";
  const transcriptMiddleware = [];
  if (enableRateLimit) {
    transcriptMiddleware.push(createTranscriptRateLimiter(options));
  }

  app.use(
    "/api/transcripts",
    ...transcriptMiddleware,
    createTranscriptRouter({
      transcriptProvider: options.transcriptProvider,
      transcriptTimeoutMs: options.transcriptTimeoutMs ?? readPositiveInteger(process.env.TRANSCRIPT_TIMEOUT_MS, 12000),
    }),
  );

  app.use((_req, _res, next) => {
    next(new ApiError(404, "NOT_FOUND", "The requested endpoint does not exist."));
  });

  app.use((error, _req, res, _next) => {
    if (error?.type === "entity.too.large") {
      return res.status(413).json({
        success: false,
        code: "PAYLOAD_TOO_LARGE",
        message: "The request payload is too large.",
      });
    }

    if (error?.type === "entity.parse.failed") {
      return res.status(400).json({
        success: false,
        code: "INVALID_JSON",
        message: "The request body must contain valid JSON.",
      });
    }

    if (isApiError(error)) {
      return res.status(error.status).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    });
  });

  return app;
}

function createTranscriptRateLimiter(options) {
  return rateLimit({
    windowMs: options.rateLimitWindowMs ?? readPositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    limit: options.rateLimitMax ?? readPositiveInteger(process.env.RATE_LIMIT_MAX, 20),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({
      success: false,
      code: "RATE_LIMITED",
      message: "Too many transcript requests. Wait a few minutes and try again.",
    }),
  });
}

function readPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
