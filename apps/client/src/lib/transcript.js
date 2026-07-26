export function formatTimestamp(value) {
  const totalSeconds = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const base = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return hours ? `${String(hours).padStart(2, "0")}:${base}` : base;
}

export function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

export function getHighlightedParts(text, query) {
  const source = String(text || "");
  const needle = String(query || "").trim();
  if (!needle) return [{ text: source, match: false }];

  const lowerSource = source.toLocaleLowerCase();
  const lowerNeedle = needle.toLocaleLowerCase();
  const parts = [];
  let cursor = 0;
  let index = lowerSource.indexOf(lowerNeedle, cursor);

  while (index !== -1) {
    if (index > cursor) parts.push({ text: source.slice(cursor, index), match: false });
    parts.push({ text: source.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
    index = lowerSource.indexOf(lowerNeedle, cursor);
  }

  if (cursor < source.length) parts.push({ text: source.slice(cursor), match: false });
  return parts.length ? parts : [{ text: source, match: false }];
}

export function countMatches(text, query) {
  return getHighlightedParts(text, query).filter((part) => part.match).length;
}

export function filterSegments(segments, query) {
  const needle = String(query || "").trim().toLocaleLowerCase();
  if (!needle) return segments;
  return segments.filter((segment) => segment.text.toLocaleLowerCase().includes(needle));
}

export async function copyTranscript(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand?.("copy");
  document.body.removeChild(textarea);
  if (!copied) throw new Error("Clipboard unavailable");
}

export function downloadTranscript(text, videoId) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `clipscripts-${videoId}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
