import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./LandingPage.jsx";

test("renders the landing page", () => {
  render(<MemoryRouter><LandingPage /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: /turn a video into searchable text/i })).toBeInTheDocument();
  expect(screen.getByLabelText("YouTube URL")).toBeInTheDocument();
});

test("shows validation feedback for an unsupported URL", async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><LandingPage /></MemoryRouter>);

  await user.type(screen.getByLabelText("YouTube URL"), "https://example.com/video");
  await user.click(screen.getByRole("button", { name: "Get transcript" }));

  expect(screen.getByRole("alert")).toHaveTextContent("supported YouTube video URL");
});

test("navigates when a supported URL is submitted", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/transcript/:videoId" element={<div>Transcript route</div>} />
      </Routes>
    </MemoryRouter>,
  );

  await user.type(screen.getByLabelText("YouTube URL"), "https://youtu.be/dQw4w9WgXcQ");
  await user.click(screen.getByRole("button", { name: "Get transcript" }));

  expect(screen.getByText("Transcript route")).toBeInTheDocument();
});
