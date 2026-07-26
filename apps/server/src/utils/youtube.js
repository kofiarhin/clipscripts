import { ApiError } from "../errors.js";

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const LANGUAGE_PATTERN = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const PATH_PREFIXES = new Set(["shorts", "embed", "live"]);
export const MAX_URL_LENGTH = 2048;

export function extractVideoId(value) {
  if (typeof value !== "string" || !value.trim() || value.length > MAX_URL_LENGTH) return null;

  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;

    if (url.hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return ID_PATTERN.test(id || "") ? id : null;
    }

    if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

    const watchId = url.pathname === "/watch" ? url.searchParams.get("v") : null;
    if (ID_PATTERN.test(watchId || "")) return watchId;

    const [prefix, id] = url.pathname.split("/").filter(Boolean);
    if (PATH_PREFIXES.has(prefix) && ID_PATTERN.test(id || "")) return id;

    return null;
  } catch {
    return null;
  }
}

export function validateTranscriptRequest(body) {
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) throw new ApiError(400, "URL_REQUIRED", "A YouTube URL is required.");
  if (url.length > MAX_URL_LENGTH) {
    throw new ApiError(400, "URL_TOO_LONG", `YouTube URLs must be ${MAX_URL_LENGTH} characters or fewer.`);
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new ApiError(400, "INVALID_YOUTUBE_URL", "Enter a supported YouTube video URL.");
  }

  const language = body?.language == null ? "en" : String(body.language).trim();
  if (!language || language.length > 35 || !LANGUAGE_PATTERN.test(language)) {
    throw new ApiError(400, "INVALID_LANGUAGE", "Enter a valid caption language code.");
  }

  return { url, videoId, language };
}
