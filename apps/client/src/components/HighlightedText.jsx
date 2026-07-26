import { getHighlightedParts } from "../lib/transcript.js";

export default function HighlightedText({ text, query }) {
  return getHighlightedParts(text, query).map((part, index) =>
    part.match ? (
      <mark key={`${index}-${part.text}`} className="rounded bg-amber-200 px-0.5 text-slate-950">
        {part.text}
      </mark>
    ) : (
      <span key={`${index}-${part.text}`}>{part.text}</span>
    ),
  );
}
