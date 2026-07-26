# ClipScripts Anonymous MVP Specification

**Status:** Approved for implementation  
**Version:** 1.0  
**Repository:** `kofiarhin/clipscripts`  
**Target branch:** `main`

## 1. Product summary

ClipScripts is an anonymous web application that converts an accessible YouTube caption track into readable, searchable transcript text. A visitor pastes a supported YouTube URL, waits while the caption track is retrieved, and receives a transcript workspace with full-text and timestamped views.

The MVP validates the core value proposition without accounts, persistence, payments, AI summarization, audio downloading, or speech-to-text fallback.

## 2. Product goals

1. Make transcript retrieval understandable and fast for non-technical users.
2. Return the complete accessible caption track rather than a partial preview.
3. Preserve timestamped segments for navigation and research use.
4. Make long transcripts easier to scan through search and view switching.
5. Provide useful copy and plain-text export actions.
6. Fail clearly when a URL is invalid, captions are unavailable, the provider times out, or requests are rate-limited.
7. Keep the implementation replaceable because the initial transcript provider is unofficial.

## 3. Non-goals

The MVP does not include:

- authentication or user accounts;
- transcript history or MongoDB persistence;
- AI summaries, questions, translation, or content generation;
- PDF, Markdown, SRT, or VTT export;
- audio or video downloading;
- Whisper or other speech-to-text fallback;
- payments, subscriptions, quotas, or billing;
- embedded YouTube playback;
- video title, thumbnail, duration, channel, or other metadata lookup;
- analytics or production deployment configuration.

## 4. Target users and use cases

### 4.1 Content researcher

Needs to turn a public video with captions into searchable text for research, quoting, note-taking, or content review.

### 4.2 Creator or editor

Needs a quick transcript for repurposing, scripting, caption review, or identifying useful sections.

### 4.3 Learner

Needs to search and reread spoken material without repeatedly scrubbing through a video.

## 5. Primary user journey

1. The visitor opens `/`.
2. They paste a supported YouTube URL.
3. Client-side validation rejects unsupported or malformed URLs immediately.
4. A valid submission routes to `/transcript/:videoId`.
5. The transcript page sends `POST /api/transcripts` with the canonical watch URL and language `en`.
6. A loading state communicates that captions are being retrieved.
7. On success, the transcript workspace displays summary metrics, actions, search, and view tabs.
8. The visitor can search, copy, download, switch views, retry, or start a new transcript.
9. On failure, the interface explains the error and provides a useful next action.

## 6. Supported YouTube URL forms

The application accepts HTTP or HTTPS URLs with an 11-character YouTube video ID in one of these forms:

- `youtube.com/watch?v=VIDEO_ID`
- `www.youtube.com/watch?v=VIDEO_ID`
- `m.youtube.com/watch?v=VIDEO_ID`
- `youtu.be/VIDEO_ID`
- `youtube.com/shorts/VIDEO_ID`
- `youtube.com/embed/VIDEO_ID`
- `youtube.com/live/VIDEO_ID`

The application rejects:

- non-YouTube hosts;
- credentials embedded in a URL;
- unsupported protocols;
- missing or malformed video IDs;
- channel, playlist, search, profile, or homepage URLs;
- URLs longer than 2,048 characters.

## 7. Routes and screens

### 7.1 Landing page — `/`

Required content:

- ClipScripts brand and concise value proposition;
- YouTube URL input with visible label;
- primary “Get transcript” action;
- supported-content guidance;
- privacy and limitation note explaining that accessible captions are retrieved and audio is not downloaded;
- inline validation error;
- responsive desktop and mobile layout.

Behavior:

- submission trims the input;
- invalid input stays on the page and receives clear error feedback;
- valid input routes to `/transcript/:videoId` and preserves the original URL in route state.

### 7.2 Transcript workspace — `/transcript/:videoId`

Loading state:

- identifies the video ID being processed;
- uses an `aria-live` status region;
- displays a non-blocking progress treatment rather than a blank page.

Success state:

- shows the video ID;
- shows word count and segment count;
- provides Full text and Timestamps tabs;
- provides transcript search and match count;
- provides Copy transcript and Download `.txt` actions;
- provides a “New transcript” action;
- focuses the results heading after retrieval.

Error state:

- uses a stable title and message based on the API error code;
- provides Retry when retrying may help;
- provides “Try another video” for validation and caption-availability errors;
- never exposes provider stack traces or raw internal messages.

### 7.3 Not-found page — wildcard route

Required content:

- clear not-found message;
- link back to the landing page.

## 8. Transcript workspace behavior

### 8.1 Full-text view

- Displays the complete normalized transcript in reading-friendly text.
- Search is case-insensitive.
- Matching text is visually highlighted.
- A match count is displayed.
- Empty search restores the complete transcript.

### 8.2 Timestamped view

- Displays every segment with a formatted `MM:SS` or `HH:MM:SS` offset.
- Search filters segments to those containing the query.
- Matching text is highlighted.
- An empty-result state appears when no segment matches.

### 8.3 Copy

- Copies the complete transcript text, regardless of active tab or search query.
- Shows temporary success feedback.
- Shows failure feedback when clipboard access is unavailable.
- Uses a safe fallback where supported.

### 8.4 Plain-text download

- Downloads the complete transcript text as UTF-8 plain text.
- File name: `clipscripts-<videoId>.txt`.
- The downloaded file is independent of active tab and search query.

## 9. Client architecture

### 9.1 State ownership

- TanStack Query owns transcript server state.
- Local component state owns active tab, search query, and action feedback.
- Redux Toolkit is not required because there is no cross-route global client state.

### 9.2 API boundary

- Network logic lives in `src/lib/api.js`.
- Components receive parsed response data or a structured client error.
- `VITE_API_URL` may override the API origin.
- Local development uses a Vite `/api` proxy to `http://localhost:5000`.

### 9.3 Utility boundary

Reusable utilities handle:

- YouTube video-ID extraction;
- timestamp formatting;
- query-safe highlighting;
- word and match counting;
- clipboard fallback;
- plain-text download creation.

## 10. Server architecture

Request pipeline:

1. Helmet security headers.
2. CORS restricted to the configured client origin.
3. JSON body parser limited to 10 KB.
4. Rate limiter for transcript requests.
5. Transcript request validation.
6. Video-ID extraction.
7. Provider call through a service boundary.
8. Timeout enforcement.
9. Segment normalization.
10. Stable success or error response.

The provider remains dependency-injected so tests never call YouTube.

## 11. API contract

### 11.1 Health

`GET /health`

Response:

```json
{
  "status": "ok"
}
```

### 11.2 Create transcript

`POST /api/transcripts`

Request body:

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "language": "en"
}
```

Validation:

- `url` is required and must be a string;
- URL maximum length is 2,048 characters;
- URL must match a supported YouTube form;
- `language` defaults to `en`;
- language must be a compact BCP-47-style tag no longer than 35 characters.

Success response — `200`:

```json
{
  "success": true,
  "data": {
    "videoId": "VIDEO_ID",
    "language": "en",
    "text": "Complete transcript text",
    "segments": [
      {
        "text": "Caption segment",
        "offset": 0,
        "duration": 2.5
      }
    ]
  }
}
```

`offset` and `duration` are expressed in seconds.

## 12. Error taxonomy

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `URL_REQUIRED` | URL missing or not a string |
| 400 | `URL_TOO_LONG` | URL exceeds 2,048 characters |
| 400 | `INVALID_YOUTUBE_URL` | URL is malformed or unsupported |
| 400 | `INVALID_LANGUAGE` | Language tag is invalid |
| 400 | `INVALID_JSON` | Request body contains invalid JSON |
| 404 | `TRANSCRIPT_UNAVAILABLE` | Accessible captions do not exist or cannot be selected |
| 413 | `PAYLOAD_TOO_LARGE` | JSON payload exceeds the configured limit |
| 429 | `RATE_LIMITED` | Client exceeded the application request limit |
| 502 | `UPSTREAM_UNAVAILABLE` | Provider failed unexpectedly |
| 503 | `UPSTREAM_RATE_LIMITED` | YouTube or provider rate-limited the request |
| 504 | `PROVIDER_TIMEOUT` | Provider did not respond within the timeout |
| 500 | `INTERNAL_ERROR` | Unexpected application failure |

Every error response follows:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Safe public message"
}
```

## 13. Rate limiting and timeout defaults

- Window: 15 minutes.
- Maximum transcript requests per client IP: 20.
- Standard rate-limit headers enabled.
- Tests bypass rate limiting unless explicitly testing it.
- Provider timeout: 12 seconds.
- Values are configurable through environment variables.

## 14. Accessibility requirements

- Inputs and actions have visible labels or accessible names.
- Validation and loading feedback use appropriate live regions.
- Tabs use button semantics and `aria-pressed`.
- Focus moves to the results heading after successful retrieval.
- Keyboard users can reach every action.
- Focus indicators remain visible.
- Text and controls maintain readable contrast.
- Search highlights use semantic `<mark>` elements.

## 15. Responsive requirements

- Minimum supported viewport width: 320 px.
- Primary actions stack on small screens and align horizontally when space permits.
- Transcript lines wrap without horizontal scrolling.
- Timestamp rows remain readable on mobile.
- The main reading column is constrained for comfortable line length.

## 16. Security and privacy requirements

- No secrets or credentials are committed.
- No arbitrary URL fetching is allowed; only supported YouTube hosts pass validation.
- Request body size is limited.
- Public errors do not expose stack traces or upstream response bodies.
- CORS is restricted to the configured client origin.
- Rate limiting reduces automated abuse.
- Transcript text is not stored by the anonymous MVP.
- ClipScripts does not download audio or video content.

## 17. Testing strategy

### 17.1 Server unit and integration tests

- standard watch URL;
- short URL;
- shorts URL;
- embed URL;
- live URL;
- invalid host;
- invalid protocol;
- malformed ID;
- missing URL;
- oversized URL;
- invalid language;
- successful provider response and normalization;
- transcript unavailable;
- upstream rate limit;
- provider timeout;
- application rate limit;
- health endpoint.

Provider calls are mocked.

### 17.2 Client tests

- landing page renders;
- invalid URL displays validation feedback;
- valid URL navigates to transcript route;
- transcript loading state;
- successful full-text render;
- timestamp tab;
- search highlighting and filtering;
- no-match state;
- copy success and failure feedback;
- download action;
- structured API failure and retry action.

### 17.3 Verification commands

```bash
npm install
npm run lint
npm test
npm run build
```

GitHub Actions runs the same verification on pushes to `main` and on pull requests.

## 18. Acceptance criteria

The MVP is complete when:

1. This specification exists and the README links to it.
2. Supported URLs reach the transcript provider.
3. Unsupported URLs fail before provider execution.
4. Successful responses contain complete normalized text and timestamped segments.
5. Full-text and timestamped views work.
6. Search reports and highlights matches.
7. Copy copies the complete transcript.
8. Download creates `clipscripts-<videoId>.txt`.
9. Loading, invalid URL, unavailable captions, rate limit, timeout, upstream failure, and unexpected failure states are understandable.
10. The interface is usable at mobile and desktop widths.
11. Lint, server tests, client tests, and the production build pass.
12. A root lockfile is committed.
13. GitHub Actions verifies the repository.
14. No secrets are committed.
15. Provider limitations remain documented.

## 19. Operational limitations

The initial provider uses an undocumented YouTube interface and requires no YouTube API key. It may stop working when YouTube changes its page or caption behavior. YouTube may also block hosting-provider IP addresses. Captions may be unavailable, incomplete, inaccurate, delayed for live videos, or absent for restricted content.

Provider replacement is expected to be possible without changing the public API contract or transcript workspace.

## 20. Future opportunities

These items are exploratory and not approved for this MVP:

- user accounts and transcript history;
- MongoDB-backed caching or persistence;
- language selection and translation;
- Markdown, PDF, SRT, and VTT export;
- summaries and transcript Q&A;
- metadata and embedded video playback;
- authorized speech-to-text fallback;
- usage plans and billing.
