import { fetchTranscript } from "../services/transcriptService.js";
import { validateTranscriptRequest } from "../utils/youtube.js";

export function createTranscriptController({ transcriptProvider, transcriptTimeoutMs } = {}) {
  return async function createTranscript(req, res, next) {
    try {
      const { videoId, language } = validateTranscriptRequest(req.body);
      const data = await fetchTranscript(videoId, language, {
        provider: transcriptProvider,
        timeoutMs: transcriptTimeoutMs,
      });

      return res.json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  };
}
