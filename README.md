# HireDOC

AI-powered hiring workspace — recruiters create smart job pages; MiniMax screens and summarizes candidates.

## Repository structure

| Path | Description |
|------|-------------|
| [`frontend/`](frontend/) | Next.js recruiter UI and public apply flow |
| [`backend/`](backend/) | Express API, MongoDB, MiniMax integration |

## Run locally

### Backend (port 5000)

```bash
cd backend
npm install
cp .env.example .env   # set JWT_SECRET (32+ chars); MINIMAX_* for AI features
npm run db:up          # MongoDB via Docker (or use local Mongo on 27017)
npm run dev
```

Verify: `GET http://localhost:5000/health` → `{ "status": "ok" }`

### Frontend (port 3000)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:5000` in `frontend/.env.local`.

### Recruiter auth

Sign in at `/login` with email OTP. In development, the API returns `dev_otp` in the send-otp response (shown on the login screen).

## End-to-end flow

1. Log in → create job → analyze JD → publish
2. Share `/apply/{slug}` with candidates (PDF resume required)
3. View applicants on `/dashboard?jobId={id}`
