# ClipScripts

Turn YouTube videos into readable, searchable transcripts.

## MVP flow

1. A user submits a standard YouTube or `youtu.be` URL.
2. The client validates and routes to the transcript page.
3. The server extracts the video ID and requests an accessible caption track.
4. The API returns normalized segments and full transcript text, or a clear unavailable-caption error.

## Architecture

ClipScripts is an npm-workspaces MERN monorepo:

- `apps/client`: React, Vite, Tailwind CSS, React Router, TanStack Query, Vitest, React Testing Library.
- `apps/server`: Node.js, Express, Mongoose, Jest, Supertest, CORS, Helmet, Morgan, dotenv, and `youtube-transcript`.
- MongoDB wiring is included for future persistence, but the initial transcript endpoint does not require stored data.

## Local setup

```bash
git clone https://github.com/kofiarhin/clipscripts.git
cd clipscripts
npm install
cp .env.example .env
npm run dev
```

## Environment variables

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=
```

Never commit real credentials.

## Scripts

- `npm run dev`
- `npm run dev:client`
- `npm run dev:server`
- `npm run build`
- `npm run test`
- `npm run lint`

## API contract

`POST /api/transcripts`

Request:

```json
{"url":"https://www.youtube.com/watch?v=VIDEO_ID","language":"en"}
```

Success:

```json
{"success":true,"data":{"videoId":"VIDEO_ID","text":"Full transcript text","segments":[]}}
```

Unavailable captions:

```json
{"success":false,"code":"TRANSCRIPT_UNAVAILABLE","message":"No accessible transcript was found for this video."}
```

## Known transcript limitations

ClipScripts only retrieves caption tracks that are accessible for a video; it does not download audio or transcribe video audio. Videos without accessible captions return `TRANSCRIPT_UNAVAILABLE`.

The initial provider is unofficial and does not require a YouTube API key. It may break if YouTube changes its internal interface. Availability, language selection, segment timing, and generated-caption quality depend on YouTube and the source video.
