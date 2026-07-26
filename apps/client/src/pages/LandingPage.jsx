import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractVideoId } from "../lib/youtube.js";

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Enter a valid YouTube URL.");
      return;
    }
    navigate(`/transcript/${videoId}`, { state: { url } });
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-4xl font-bold">ClipScripts</h1>
      <p className="mt-3">Turn YouTube videos into readable, searchable transcripts.</p>
      <form onSubmit={submit} className="mt-8">
        <label htmlFor="youtube-url" className="block font-medium">YouTube URL</label>
        <input id="youtube-url" value={url} onChange={(event) => setUrl(event.target.value)} className="mt-2 w-full rounded border p-3" placeholder="https://www.youtube.com/watch?v=..." />
        <button className="mt-4 rounded bg-slate-900 px-4 py-2 text-white">Get transcript</button>
        {error && <p role="alert" className="mt-3">{error}</p>}
      </form>
    </main>
  );
}
