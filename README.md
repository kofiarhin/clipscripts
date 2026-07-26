# ClipScripts

Turn accessible YouTube caption tracks into readable, searchable transcripts.

> ClipScripts retrieves captions that YouTube exposes for a video. It does not download video audio or create speech-to-text transcripts.

## Product specification

The canonical anonymous-MVP specification is available in [`docs/SPEC.md`](docs/SPEC.md).

## MVP flow

1. A user submits a supported YouTube URL.
2. The client validates the URL and opens the transcript workspace.
3. The API validates the request, extracts the video ID, and requests an accessible caption track.
4. ClipScripts returns normalized timestamped segments and complete transcript text.
5. The user can search, copy, or download the transcript as plain text.

## Architecture

ClipScripts is an npm-workspaces MERN monorepo:

- `apps/client`: React, Vite, Tailwind CSS, React Router, TanStack Query, Vitest, and React Testing Library.
- `apps/server`: Node.js, Express, Mongoose, Jest, Supertest, CORS, Helmet, Morgan, dotenv, `express-rate-limit`, and `youtube-transcript`.
- MongoDB wiring remains optional. The anonymous MVP does not persist transcripts.

## Local setup

Requirements:

- Node.js 20.19+ or 22.12+
- npm 10+

```bash
git clone https://github.com/kofiarhin/clipscripts.git
cd clipscripts
npm install
cp .env.example .env
npm run dev
```

The client runs on `http://localhost:5173` and proxies `/api` requests to the server on `http://localhost:5000`.

## Environment variables

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=
TRANSCRIPT_TIMEOUT_MS=12000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=20
TRUST_PROXY=0
```

Never commit real credentials.

## Scripts

- `npm run dev`
- `npm run dev:client`
- `npm run dev:server`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run check`

## API contract

### `POST /api/transcripts`

Request:

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "language": "en"
}
```

Success:

```json
{
  "success": true,
  "data": {
    "videoId": "VIDEO_ID",
    "language": "en",
    "text": "Full transcript text",
    "segments": [
      {
        "text": "Caption text",
        "offset": 0,
        "duration": 2.5
      }
    ]
  }
}
```

Unavailable captions:

```json
{
  "success": false,
  "code": "TRANSCRIPT_UNAVAILABLE",
  "message": "No accessible transcript was found for this video."
}
```

## Known limitations

- The transcript provider is unofficial and may break if YouTube changes its internal interface.
- Caption availability, language support, timestamps, and accuracy depend on YouTube and the source video.
- Private, age-restricted, members-only, region-restricted, live, or caption-disabled videos may fail.
- Hosting-provider IP addresses may be rate-limited or blocked by YouTube.
- ClipScripts does not download audio or use Whisper or another speech-to-text system.
