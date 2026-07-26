import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import TranscriptPage from "./pages/TranscriptPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/transcript/:videoId" element={<TranscriptPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
