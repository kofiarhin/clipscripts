import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TranscriptPage from "./TranscriptPage.jsx";

const transcript = {
  videoId: "dQw4w9WgXcQ",
  language: "en",
  text: "Hello React world. React makes interfaces.",
  segments: [
    { text: "Hello React world.", offset: 0, duration: 2 },
    { text: "React makes interfaces.", offset: 65, duration: 3 },
  ],
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TranscriptPage", () => {
  test("shows a loading state while captions are retrieved", () => {
    fetch.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("Retrieving captions")).toBeInTheDocument();
  });

  test("renders, searches, and switches transcript views", async () => {
    mockApiSuccess(transcript);
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("Hello React world. React makes interfaces.")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search transcript"), "react");
    expect(screen.getByText("2 matches found")).toBeInTheDocument();
    expect(screen.getAllByText("React", { selector: "mark" })).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Timestamps" }));
    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  test("filters timestamped segments and shows a no-match state", async () => {
    mockApiSuccess(transcript);
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Hello React world. React makes interfaces.");
    await user.click(screen.getByRole("button", { name: "Timestamps" }));
    await user.type(screen.getByLabelText("Search transcript"), "missing");

    expect(screen.getByText("No timestamped segments match")).toBeInTheDocument();
  });

  test("copies the complete transcript", async () => {
    mockApiSuccess(transcript);
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    renderPage();

    await screen.findByText("Hello React world. React makes interfaces.");
    await user.click(screen.getByRole("button", { name: "Copy transcript" }));

    expect(writeText).toHaveBeenCalledWith(transcript.text);
    expect(screen.getByText("Transcript copied to your clipboard.")).toBeInTheDocument();
  });

  test("downloads the complete transcript", async () => {
    mockApiSuccess(transcript);
    const createObjectURL = vi.fn(() => "blob:transcript");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Hello React world. React makes interfaces.");
    await user.click(screen.getByRole("button", { name: "Download .txt" }));

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:transcript");
  });

  test("shows a structured unavailable-transcript error", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        code: "TRANSCRIPT_UNAVAILABLE",
        message: "No accessible transcript was found for this video.",
      }),
    });
    renderPage();

    expect(await screen.findByRole("heading", { name: "Transcript unavailable" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try another video" })).toBeInTheDocument();
  });

  test("allows a retry after a timeout", async () => {
    fetch
      .mockResolvedValueOnce(errorResponse(504, "PROVIDER_TIMEOUT", "Timed out"))
      .mockResolvedValueOnce(errorResponse(504, "PROVIDER_TIMEOUT", "Timed out"))
      .mockResolvedValueOnce(successResponse(transcript));
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole("heading", { name: "Caption request timed out" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Hello React world. React makes interfaces.")).toBeInTheDocument();
  });
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/transcript/dQw4w9WgXcQ"]}>
        <Routes>
          <Route path="/transcript/:videoId" element={<TranscriptPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockApiSuccess(data) {
  fetch.mockResolvedValue(successResponse(data));
}

function successResponse(data) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true, data }),
  };
}

function errorResponse(status, code, message) {
  return {
    ok: false,
    status,
    json: async () => ({ success: false, code, message }),
  };
}
