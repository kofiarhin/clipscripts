import { useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import TranscriptViewer from "../components/TranscriptViewer.jsx";
import { createTranscript } from "../lib/api.js";

const ERROR_CONTENT = {
  TRANSCRIPT_UNAVAILABLE: {
    title: "Transcript unavailable",
    message: "This video does not have an accessible caption track in the requested language.",
  },
  RATE_LIMITED: {
    title: "Too many requests",
    message: "ClipScripts is receiving too many requests from this connection. Wait a few minutes and try again.",
  },
  UPSTREAM_RATE_LIMITED: {
    title: "YouTube is limiting requests",
    message: "The caption provider is temporarily rate-limited. Try again shortly.",
  },
  PROVIDER_TIMEOUT: {
    title: "Caption request timed out",
    message: "YouTube took too long to return captions. Retrying may help.",
  },
  UPSTREAM_UNAVAILABLE: {
    title: "Caption provider unavailable",
    message: "The caption provider could not complete this request. Try again later or use another video.",
  },
  NETWORK_ERROR: {
    title: "Connection problem",
    message: "ClipScripts could not reach the API. Check your connection and try again.",
  },
};

export default function TranscriptPage() {
  const { videoId } = useParams();
  const { state } = useLocation();
  const headingRef = useRef(null);

  const query = useQuery({
    queryKey: ["transcript", videoId],
    queryFn: ({ signal }) => createTranscript({
      url: state?.url || `https://www.youtube.com/watch?v=${videoId}`,
      language: "en",
    }, { signal }),
    retry: (failureCount, error) => failureCount < 1 && Number(error?.status) >= 500,
    retryDelay: 100,
  });

  useEffect(() => {
    if (query.isSuccess) headingRef.current?.focus();
  }, [query.isSuccess]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-3 font-black tracking-tight text-slate-950">
            <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white">C</span>
            ClipScripts
          </Link>
          <Link to="/" className="secondary-button">New transcript</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8">
          <p className="eyebrow">Transcript workspace</p>
          <h1 ref={headingRef} tabIndex="-1" className="mt-3 text-4xl font-black tracking-tight text-slate-950 outline-none sm:text-5xl">
            Your transcript
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">Search, review, copy, and export the complete accessible caption track.</p>
        </div>

        {query.isPending && <LoadingState videoId={videoId} />}
        {query.isError && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
        {query.data && <TranscriptViewer transcript={query.data} />}
      </main>
    </div>
  );
}

function LoadingState({ videoId }) {
  return (
    <section className="panel overflow-hidden p-6 sm:p-8" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-4">
        <span className="spinner" aria-hidden="true" />
        <div>
          <h2 className="text-xl font-bold text-slate-950">Retrieving captions</h2>
          <p className="mt-1 text-sm text-slate-500">Checking accessible tracks for <span className="font-mono">{videoId}</span>.</p>
        </div>
      </div>
      <div className="mt-8 space-y-3" aria-hidden="true">
        <div className="skeleton h-4 w-11/12" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-9/12" />
        <div className="skeleton h-4 w-10/12" />
      </div>
    </section>
  );
}

function ErrorState({ error, onRetry }) {
  const content = ERROR_CONTENT[error?.code] || {
    title: "Transcript request failed",
    message: error?.message || "ClipScripts could not complete this request.",
  };
  const retryable = !["TRANSCRIPT_UNAVAILABLE", "INVALID_YOUTUBE_URL", "URL_REQUIRED"].includes(error?.code);

  return (
    <section className="panel border-rose-200 p-6 sm:p-8" role="alert">
      <div className="grid size-12 place-items-center rounded-2xl bg-rose-100 text-xl font-black text-rose-700">!</div>
      <h2 className="mt-5 text-2xl font-black text-slate-950">{content.title}</h2>
      <p className="mt-3 max-w-2xl leading-7 text-slate-600">{content.message}</p>
      {error?.code && <p className="mt-3 font-mono text-xs text-slate-400">Error code: {error.code}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        {retryable && <button type="button" onClick={onRetry} className="primary-button">Retry</button>}
        <Link to="/" className="secondary-button">Try another video</Link>
      </div>
    </section>
  );
}
