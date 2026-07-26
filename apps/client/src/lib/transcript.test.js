import { describe, expect, test } from "vitest";
import {
  countMatches,
  countWords,
  filterSegments,
  formatTimestamp,
  getHighlightedParts,
} from "./transcript.js";

describe("transcript utilities", () => {
  test("formats short and long timestamps", () => {
    expect(formatTimestamp(65.9)).toBe("01:05");
    expect(formatTimestamp(3661)).toBe("01:01:01");
  });

  test("counts words and case-insensitive matches", () => {
    expect(countWords("Hello   world")).toBe(2);
    expect(countMatches("React helps React apps", "react")).toBe(2);
  });

  test("creates highlighted parts without changing text", () => {
    expect(getHighlightedParts("Hello world", "world")).toEqual([
      { text: "Hello ", match: false },
      { text: "world", match: true },
    ]);
  });

  test("filters timestamped segments", () => {
    const segments = [{ text: "React basics" }, { text: "Node basics" }];
    expect(filterSegments(segments, "react")).toEqual([{ text: "React basics" }]);
  });
});
