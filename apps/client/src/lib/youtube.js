export function extractVideoId(value) {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1);
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      const id = url.searchParams.get("v");
      return /^[\w-]{11}$/.test(id || "") ? id : null;
    }
    return null;
  } catch {
    return null;
  }
}
