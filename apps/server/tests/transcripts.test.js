import request from "supertest";
import { createApp } from "../src/app.js";

describe("POST /api/transcripts", () => {
  test("rejects a missing URL", async () => {
    const response = await request(createApp()).post("/api/transcripts").send({});
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("URL_REQUIRED");
  });

  test("returns a normalized transcript", async () => {
    const provider = {
      fetchTranscript: jest.fn().mockResolvedValue([
        { text: "Hello", offset: 0, duration: 1 },
        { text: "world", offset: 1, duration: 1 },
      ]),
    };

    const response = await request(createApp({ transcriptProvider: provider }))
      .post("/api/transcripts")
      .send({ url: "https://youtu.be/dQw4w9WgXcQ", language: "en" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        videoId: "dQw4w9WgXcQ",
        text: "Hello world",
        segments: [
          { text: "Hello", offset: 0, duration: 1 },
          { text: "world", offset: 1, duration: 1 },
        ],
      },
    });
  });

  test("returns transcript unavailable", async () => {
    const provider = { fetchTranscript: jest.fn().mockRejectedValue(new Error("Transcript unavailable")) };
    const response = await request(createApp({ transcriptProvider: provider }))
      .post("/api/transcripts")
      .send({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      code: "TRANSCRIPT_UNAVAILABLE",
      message: "No accessible transcript was found for this video.",
    });
  });
});
