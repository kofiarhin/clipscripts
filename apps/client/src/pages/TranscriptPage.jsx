import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createTranscript } from "../lib/api.js";

export default function TranscriptPage() {
  const { videoId } = useParams();
  const { state } = useLocation();
  const query = useQuery({
    queryKey: ["transcript", videoId],
    queryFn: () => createTranscript({
      url: state?.url || `https://www.youtube.com/watch?v=${videoId}`,
      language: "en",
    }),
  });

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">Transcript</h1>
      {query.isPending && <p>Loading transcript…</p>}
      {query.isError && <p role="alert">{query.error.message}</p>}
      {query.data && <p className="mt-6 whitespace-pre-wrap">{query.data.data.text}</p>}
    </main>
  );
}
