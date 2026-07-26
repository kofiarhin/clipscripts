import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
      <section className="panel max-w-lg p-8 text-center sm:p-12">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Page not found</h1>
        <p className="mt-4 leading-7 text-slate-600">The page you requested does not exist. Start with a YouTube URL instead.</p>
        <Link to="/" className="primary-button mt-7 inline-flex">Go to ClipScripts</Link>
      </section>
    </main>
  );
}
