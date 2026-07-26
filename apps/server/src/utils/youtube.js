const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function extractVideoId(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return ID_PATTERN.test(id || "") ? id : null;
    }

    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      const id = url.searchParams.get("v");
      return ID_PATTERN.test(id || "") ? id : null;
    }

    return null;
  } catch {
    return null;
  }
}
