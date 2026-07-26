import { useMemo, useState } from "react";
import HighlightedText from "./HighlightedText.jsx";
import {
  copyTranscript,
  countMatches,
  countWords,
  downloadTranscript,
  filterSegments,
  formatTimestamp,
} from "../lib/transcript.js";

export default function TranscriptViewer({ transcript }) {
  const [view, setView] = useState("full");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("");

  const filteredSegments = useMemo(
    () => filterSegments(transcript.segments, query),
    [query, transcript.segments],
  );
  const matchCount = useMemo(() => countMatches(transcript.text, query), [query, transcript.text]);
  const wordCount = useMemo(() => countWords(transcript.text), [transcript.text]);

  async function handleCopy() {
    try {
      await copyTranscript(transcript.text);
      setFeedback("Transcript copied to your clipboard.");
    } catch {
      setFeedback("Copy failed. Select the transcript text and copy it manually.");
    }
  }

  function handleDownload() {
    try {
      downloadTranscript(transcript.text, transcript.videoId);
      setFeedback("Transcript download started.");
    } catch {
      setFeedback("Download failed. Try copying the transcript instead.");
    }
  }

  return (
    <section className="space-y-6" aria-label="Transcript workspace">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Video ID" value={transcript.videoId} mono />
        <Metric label="Words" value={wordCount.toLocaleString()} />
        <Metric label="Segments" value={transcript.segments.length.toLocaleString()} />
      </div>

      <div className="panel space-y-5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <label htmlFor="transcript-search" className="label-text">
              Search transcript
            </label>
            <div className="relative mt-2">
              <input
                id="transcript-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="field pr-24"
                placeholder="Search words or phrases"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-500" aria-live="polite">
              {query.trim()
                ? `${matchCount} ${matchCount === 1 ? "match" : "matches"} found`
                : "Search is case-insensitive."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleCopy} className="secondary-button">
              Copy transcript
            </button>
            <button type="button" onClick={handleDownload} className="secondary-button">
              Download .txt
            </button>
          </div>
        </div>

        <div className="flex w-fit rounded-xl border border-slate-200 bg-slate-100 p-1" aria-label="Transcript view">
          <ViewButton active={view === "full"} onClick={() => setView("full")}>
            Full text
          </ViewButton>
          <ViewButton active={view === "timestamps"} onClick={() => setView("timestamps")}>
            Timestamps
          </ViewButton>
        </div>

        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900"
          >
            {feedback}
          </div>
        )}

        {view === "full" ? (
          <article className="transcript-copy" data-testid="full-transcript">
            <HighlightedText text={transcript.text} query={query} />
          </article>
        ) : (
          <div className="space-y-2" data-testid="timestamped-transcript">
            {filteredSegments.length ? (
              filteredSegments.map((segment, index) => (
                <div
                  key={`${segment.offset}-${index}`}
                  className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[5rem_1fr]"
                >
                  <span className="font-mono text-sm font-semibold text-indigo-700">
                    {formatTimestamp(segment.offset)}
                  </span>
                  <p className="leading-7 text-slate-700">
                    <HighlightedText text={segment.text} query={query} />
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <h3 className="font-semibold text-slate-900">No timestamped segments match</h3>
                <p className="mt-2 text-sm text-slate-500">Try a different word or clear the search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value, mono = false }) {
  return (
    <div className="panel p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-2 truncate text-lg font-bold text-slate-950 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function ViewButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}
