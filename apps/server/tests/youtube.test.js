import { describe, expect, test } from "@jest/globals";
import { extractVideoId, validateTranscriptRequest } from "../src/utils/youtube.js";

describe("extractVideoId", () => {
  test.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=20",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://youtube.com/embed/dQw4w9WgXcQ",
    "https://youtube.com/live/dQw4w9WgXcQ",
  ])("extracts the ID from %s", (url) => {
    expect(extractVideoId(url)).toBe("dQw4w9WgXcQ");
  });

  test.each([
    "https://example.com/watch?v=dQw4w9WgXcQ",
    "ftp://youtube.com/watch?v=dQw4w9WgXcQ",
    "https://user:password@youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/playlist?list=123",
    "https://youtube.com/watch?v=short",
  ])("rejects %s", (url) => {
    expect(extractVideoId(url)).toBeNull();
  });
});

describe("validateTranscriptRequest", () => {
  test("defaults the caption language to English", () => {
    expect(validateTranscriptRequest({ url: "https://youtu.be/dQw4w9WgXcQ" })).toEqual({
      url: "https://youtu.be/dQw4w9WgXcQ",
      videoId: "dQw4w9WgXcQ",
      language: "en",
    });
  });

  test("accepts a compact BCP-47 style language tag", () => {
    expect(validateTranscriptRequest({
      url: "https://youtu.be/dQw4w9WgXcQ",
      language: "pt-BR",
    }).language).toBe("pt-BR");
  });

  test("rejects an invalid language tag", () => {
    expect(() => validateTranscriptRequest({
      url: "https://youtu.be/dQw4w9WgXcQ",
      language: "english!",
    })).toThrow("valid caption language");
  });
});
