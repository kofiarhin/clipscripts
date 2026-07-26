import { Router } from "express";
import { createTranscriptController } from "../controllers/transcriptController.js";

export function createTranscriptRouter(options = {}) {
  const router = Router();
  router.post("/", createTranscriptController(options));
  return router;
}
