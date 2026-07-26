import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <Link to="/" className="underline">Return home</Link>
    </main>
  );
}
