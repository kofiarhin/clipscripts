const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const PATH_PREFIXES = new Set(["shorts", "embed", "live"]);

export function extractVideoId(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 2048) return null;

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
