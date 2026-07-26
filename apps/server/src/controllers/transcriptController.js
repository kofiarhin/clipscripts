import { extractVideoId } from "../utils/youtube.js";
import { fetchTranscript } from "../services/transcriptService.js";

export function createTranscriptController({ transcriptProvider } = {}) {
  return async function createTranscript(req, res, next) {
    try {
      const { url, language = "en" } = req.body || {};
      if (!url) {
        return res.status(400).json({ success: false, code: "URL_REQUIRED", message: "A YouTube URL is required." });
      }

      const videoId = extractVideoId(url);
      if (!videoId) {
        return res.status(400).json({ success: false, code: "INVALID_YOUTUBE_URL", message: "Enter a valid YouTube video URL." });
      }

      const data = await fetchTranscript(videoId, language, transcriptProvider);
      return res.json({ success: true, data });
    } catch (error) {
      if (error?.message === "TRANSCRIPT_UNAVAILABLE" || /transcript|caption/i.test(error?.message || "")) {
        return res.status(404).json({
          success: false,
          code: "TRANSCRIPT_UNAVAILABLE",
          message: "No accessible transcript was found for this video.",
        });
      }
      return next(error);
    }
  };
}
