# HireDOC

AI-powered hiring workspace — recruiters create smart job pages; MiniMax screens and summarizes candidates.

## Repository structure

| Path | Description |
|------|-------------|
| [`frontend/`](frontend/) | Next.js recruiter UI and public apply flow |
| [`backend/`](backend/) | Express API, MongoDB, MiniMax integration |

## Run locally

### 1. Firebase (one-time)

1. [Firebase Console](https://console.firebase.google.com) → open project `hiredoc-e6e89`
2. **Authentication** → click **Get started** (if you see it) → **Sign-in method** → enable **Email/Password**
3. [Google Cloud Console](https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=hiredoc-e6e89) → ensure **Identity Toolkit API** is **Enabled**
3. **Authentication** → Settings → Authorized domains → add `localhost` (and your production domain)
4. **Project settings** → Your apps → Web → copy config into `frontend/.env.local`
5. **Project settings** → Service accounts → **Generate new private key** → minify JSON into `FIREBASE_SERVICE_ACCOUNT_JSON` in `backend/.env`

### Backend (port 5000)

```bash
cd backend
npm install
cp .env.example .env
npm run db:up          # MongoDB via Docker (or local Mongo on 27017)
npm run dev
```

Required in `backend/.env`:

- `JWT_SECRET` (32+ characters)
- `FIREBASE_SERVICE_ACCOUNT_JSON` (single-line JSON from Firebase)
- `MINIMAX_API_KEY` / `MINIMAX_GROUP_ID` (optional, for AI features)

Verify: `GET http://localhost:5000/health` → `{ "status": "ok" }`

### Frontend (port 3000)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Fill all `NEXT_PUBLIC_FIREBASE_*` keys and `NEXT_PUBLIC_API_URL=http://localhost:5000` in `frontend/.env.local`.

### Recruiter auth

1. Open `/login` → **Sign up** with email + password
2. Check your inbox for Firebase **verification email** and click the link
3. **Sign in** — the app exchanges your Firebase session for an API token

## End-to-end flow

1. Sign in → create job → analyze JD → publish
2. Share `/apply/{slug}` with candidates (PDF resume required)
3. View applicants on `/dashboard?jobId={id}`
