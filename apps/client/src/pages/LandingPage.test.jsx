import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "./LandingPage.jsx";

test("renders landing page", () => {
  render(<MemoryRouter><LandingPage /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "ClipScripts" })).toBeInTheDocument();
  expect(screen.getByLabelText("YouTube URL")).toBeInTheDocument();
});
