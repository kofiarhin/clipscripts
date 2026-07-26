import { describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("ClipScripts API", () => {
  test("returns health status", async () => {
    const response = await request(createApp({ environment: "test" })).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("rejects a missing URL", async () => {
    const response = await request(createApp({ environment: "test" }))
      .post("/api/transcripts")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("URL_REQUIRED");
  });

  test("rejects an unsupported URL before provider execution", async () => {
    const provider = { fetchTranscript: jest.fn() };
    const response = await request(createApp({ environment: "test", transcriptProvider: provider }))
      .post("/api/transcripts")
      .send({ url: "https://example.com/watch?v=dQw4w9WgXcQ" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_YOUTUBE_URL");
    expect(provider.fetchTranscript).not.toHaveBeenCalled();
  });

  test("rejects an oversized URL", async () => {
    const response = await request(createApp({ environment: "test" }))
      .post("/api/transcripts")
      .send({ url: `https://youtu.be/dQw4w9WgXcQ?${"x".repeat(2050)}` });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("URL_TOO_LONG");
  });

  test("rejects an invalid language", async () => {
    const response = await request(createApp({ environment: "test" }))
      .post("/api/transcripts")
      .send({ url: "https://youtu.be/dQw4w9WgXcQ", language: "english!" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_LANGUAGE");
  });

  test("rejects invalid JSON", async () => {
    const response = await request(createApp({ environment: "test" }))
      .post("/api/transcripts")
      .set("Content-Type", "application/json")
      .send("{");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_JSON");
  });

  test("returns a normalized transcript", async () => {
    const provider = {
      fetchTranscript: jest.fn().mockResolvedValue([
        { text: "  Hello  ", offset: 0, duration: 1 },
        { text: "world", offset: 1, duration: 1 },
      ]),
    };

    const response = await request(createApp({ environment: "test", transcriptProvider: provider }))
      .post("/api/transcripts")
      .send({ url: "https://youtu.be/dQw4w9WgXcQ", language: "en" });

    expect(response.status).toBe(200);
    expect(provider.fetchTranscript).toHaveBeenCalledWith("dQw4w9WgXcQ", { lang: "en" });
    expect(response.body).toEqual({
      success: true,
      data: {
        videoId: "dQw4w9WgXcQ",
        language: "en",
        text: "Hello world",
        segments: [
          { text: "Hello", offset: 0, duration: 1 },
          { text: "world", offset: 1, duration: 1 },
        ],
      },
    });
  });

  test("returns transcript unavailable", async () => {
    const provider = {
      fetchTranscript: jest.fn().mockRejectedValue(new Error("Transcript is disabled on this video")),
    };

    const response = await request(createApp({ environment: "test", transcriptProvider: provider }))
      .post("/api/transcripts")
      .send({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      code: "TRANSCRIPT_UNAVAILABLE",
      message: "No accessible transcript was found for this video.",
    });
  });

  test("returns an upstream rate-limit error", async () => {
    const provider = {
      fetchTranscript: jest.fn().mockRejectedValue(new Error("429 Too Many Requests")),
    };

    const response = await request(createApp({ environment: "test", transcriptProvider: provider }))
      .post("/api/transcripts")
      .send({ url: "https://youtu.be/dQw4w9WgXcQ" });

    expect(response.status).toBe(503);
    expect(response.body.code).toBe("UPSTREAM_RATE_LIMITED");
  });

  test("returns a provider timeout", async () => {
    const provider = { fetchTranscript: jest.fn(() => new Promise(() => {})) };
    const response = await request(createApp({
      environment: "test",
      transcriptProvider: provider,
      transcriptTimeoutMs: 5,
    }))
      .post("/api/transcripts")
      .send({ url: "https://youtu.be/dQw4w9WgXcQ" });

    expect(response.status).toBe(504);
    expect(response.body.code).toBe("PROVIDER_TIMEOUT");
  });

  test("rate limits repeated transcript requests", async () => {
    const provider = { fetchTranscript: jest.fn().mockResolvedValue([{ text: "Hello", offset: 0, duration: 1 }]) };
    const app = createApp({
      environment: "test",
      enableRateLimit: true,
      rateLimitMax: 1,
      rateLimitWindowMs: 60000,
      transcriptProvider: provider,
    });

    const first = await request(app).post("/api/transcripts").send({ url: "https://youtu.be/dQw4w9WgXcQ" });
    const second = await request(app).post("/api/transcripts").send({ url: "https://youtu.be/dQw4w9WgXcQ" });

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(second.body.code).toBe("RATE_LIMITED");
  });
});
