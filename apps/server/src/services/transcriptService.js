import { YoutubeTranscript } from "youtube-transcript";

export function normalizeSegments(items = []) {
  return items
    .map((item) => ({
      text: String(item.text || "").trim(),
      offset: Number(item.offset || 0),
      duration: Number(item.duration || 0),
    }))
    .filter((item) => item.text);
}

export async function fetchTranscript(videoId, language = "en", provider = YoutubeTranscript) {
  const raw = await provider.fetchTranscript(videoId, { lang: language });
  const segments = normalizeSegments(raw);
  if (!segments.length) throw new Error("TRANSCRIPT_UNAVAILABLE");

  return {
    videoId,
    text: segments.map((segment) => segment.text).join(" "),
    segments,
  };
}
