import { YoutubeTranscript } from "youtube-transcript";
import { ApiError, isApiError } from "../errors.js";

const UNAVAILABLE_PATTERN = /disabled|not available|unavailable|no transcript|no caption|not found|invalid video/i;
const RATE_LIMIT_PATTERN = /429|too many requests|rate.?limit|ip blocked|request blocked/i;

export function normalizeSegments(items = []) {
  return items
    .map((item) => ({
      text: String(item?.text || "").replace(/\s+/g, " ").trim(),
      offset: toNonNegativeNumber(item?.offset),
      duration: toNonNegativeNumber(item?.duration),
    }))
    .filter((item) => item.text);
}

export async function fetchTranscript(
  videoId,
  language = "en",
  { provider = YoutubeTranscript, timeoutMs = 12000 } = {},
) {
  try {
    const raw = await withTimeout(
      Promise.resolve(provider.fetchTranscript(videoId, { lang: language })),
      timeoutMs,
    );
    const segments = normalizeSegments(raw);

    if (!segments.length) {
      throw new ApiError(404, "TRANSCRIPT_UNAVAILABLE", "No accessible transcript was found for this video.");
    }

    return {
      videoId,
      language,
      text: segments.map((segment) => segment.text).join(" "),
      segments,
    };
  } catch (error) {
    if (isApiError(error)) throw error;

    const details = `${error?.name || ""} ${error?.message || ""}`;
    if (RATE_LIMIT_PATTERN.test(details)) {
      throw new ApiError(503, "UPSTREAM_RATE_LIMITED", "YouTube is temporarily limiting caption requests.");
    }
    if (UNAVAILABLE_PATTERN.test(details)) {
      throw new ApiError(404, "TRANSCRIPT_UNAVAILABLE", "No accessible transcript was found for this video.");
    }

    throw new ApiError(502, "UPSTREAM_UNAVAILABLE", "The caption provider could not complete this request.");
  }
}

function withTimeout(promise, timeoutMs) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new ApiError(504, "PROVIDER_TIMEOUT", "The caption provider took too long to respond."));
    }, Math.max(1, Number(timeoutMs) || 12000));
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function toNonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}
