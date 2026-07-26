import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractVideoId } from "../lib/youtube.js";

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    const trimmedUrl = url.trim();
    const videoId = extractVideoId(trimmedUrl);

    if (!videoId) {
      setError("Enter a supported YouTube video URL.");
      return;
    }

    setError("");
    navigate(`/transcript/${videoId}`, { state: { url: trimmedUrl } });
  }

  return (
    <div className="min-h-screen bg-grid">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <a href="/" className="inline-flex items-center gap-3 font-black tracking-tight text-slate-950">
          <span className="grid size-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">C</span>
          ClipScripts
        </a>
        <span className="hidden rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 sm:inline-flex">
          Anonymous MVP
        </span>
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-20">
        <section>
          <p className="eyebrow">YouTube captions, made useful</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.03] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            Turn a video into searchable text.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Paste a YouTube URL to retrieve its complete accessible caption track, search every word, copy the transcript, or download it as plain text.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Feature title="No API key" text="Uses accessible caption tracks." />
            <Feature title="Timestamps" text="Keep every caption segment." />
            <Feature title="Private by default" text="No transcript history is stored." />
          </div>
        </section>

        <section className="panel overflow-hidden p-5 shadow-2xl shadow-slate-200/70 sm:p-7" aria-labelledby="extract-title">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Start here</p>
            <h2 id="extract-title" className="mt-2 text-2xl font-black">Get a transcript</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Works when the video has an accessible manual or auto-generated caption track.</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="youtube-url" className="label-text">YouTube URL</label>
              <input
                id="youtube-url"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  if (error) setError("");
                }}
                className="field mt-2"
                placeholder="https://www.youtube.com/watch?v=..."
                autoComplete="url"
                inputMode="url"
                aria-describedby="url-help url-error"
                aria-invalid={Boolean(error)}
              />
              <p id="url-help" className="mt-2 text-sm text-slate-500">
                Supports watch, short, shorts, embed, and live video URLs.
              </p>
              {error && (
                <p id="url-error" role="alert" className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </p>
              )}
            </div>

            <button type="submit" className="primary-button w-full">Get transcript</button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-500">
            ClipScripts does not download video or audio. Videos without accessible captions will return a clear unavailable message.
          </div>
        </section>
      </main>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}
