export class TranscriptApiError extends Error {
  constructor(message, { code = "REQUEST_FAILED", status = 0 } = {}) {
    super(message);
    this.name = "TranscriptApiError";
    this.code = code;
    this.status = status;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export async function createTranscript(payload, { signal } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/transcripts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new TranscriptApiError("Unable to reach ClipScripts. Check your connection and try again.", {
      code: "NETWORK_ERROR",
    });
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new TranscriptApiError("ClipScripts received an invalid server response.", {
      code: "INVALID_RESPONSE",
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new TranscriptApiError(body.message || "Transcript request failed.", {
      code: body.code,
      status: response.status,
    });
  }

  return body.data;
}
