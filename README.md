# تمريضيانو · Tamrediano

> Smart MCQ training platform for nursing students. White & Gold theme, mobile-first, RTL Arabic.

## Project Overview
- **Name**: Tamrediano (تمريضيانو)
- **Goal**: An exam-prep platform where admins ingest study material (PDF/TXT) and Gemini auto-generates high-quality nursing MCQs; students take randomized, anti-cheat exams with instant Egyptian-Arabic feedback and an AI tutor.
- **Stack**: React 18 + Vite + TypeScript + Tailwind, Hono on Cloudflare Pages Functions, Firebase Firestore, Gemini 2.5 Flash + Gemini 1.5 Flash.

## Live URLs
- **Sandbox preview**: https://3000-igmz8fp84j7kns935305i-5c13a017.sandbox.novita.ai
- **API health**: `/api/health`
- **Production (after deploy)**: `https://<project>.pages.dev`

## Currently completed features
- ✅ Global auth state with localStorage persistence (solves "Lost Auth State" pitfall) — `src/contexts/AuthContext.tsx`
- ✅ Login page: fuzzy-search by name (Fuse.js) + hidden Admin Bypass (Ctrl click "دخول الإدارة")
- ✅ IP tracking on student login + auto-flag if >3 distinct IPs
- ✅ Admin Dashboard with persistent sidebar and 5 tabs:
  - **Extraction Lab**: drag-and-drop file zone, PDF/TXT parser (worker-safe with fallback), Gemini MCQ generator with strict uniformity rules
  - **Draft Manager**: table CRUD, color tags (5 colors), >90% similarity duplicate detection, edit modal, publish to live banks
  - **Student Management**: activity log, allowed students list, AI Name Extractor (messy text → clean names)
  - **Analytics**: per-question fail-rate heatmap (>60% highlighted red), leaderboard sorted by score then time
  - **Moderation**: maintenance toggle, manual ban, ban list with unban
- ✅ Exam Engine: Fisher–Yates shuffle of questions AND options per session, swipeable number carousel, bookmarks, lightbox for images, instant feedback with explanation + citation, localStorage auto-save
- ✅ AI Tutor modal (5-minute conversation memory, Egyptian Arabic, refuses to reveal direct answer)
- ✅ "Talk to Leaders" reports with smart grouping (5 categories) and **auto-ban after 3 reports**
- ✅ Auto-ban on explicit/insulting language in tutor chat (client + server-side check)
- ✅ Results page: animated score circle, "Know What to Study" Gemini summary (TEXT-only, no tables), **working** "Save as Task List" .txt download, 5-star rating + comment
- ✅ Premium custom drag-and-drop UI everywhere (no ugly default file inputs)
- ✅ PDF parsing with `pdfjs-dist` worker URL configured via Vite, with `disableWorker: true` fallback so the app **never crashes** on PDF errors
- ✅ Hono backend proxy at `/api/*` keeps the Gemini API key server-side (Cloudflare Pages Function)

## Functional entry URIs

### Frontend routes
| Path                | Role     | Description |
|---------------------|----------|-------------|
| `/`                 | public   | Auto-redirect: admin → `/admin-dashboard`, student → `/exam`, else login |
| `/login`            | public   | Same login UI |
| `/admin-dashboard`  | admin    | Sidebar with all admin tabs |
| `/exam`             | student  | Question runner |
| `/results`          | student  | Score + study guide + rating |

### API endpoints (Hono on Cloudflare Pages Functions)
| Method | Path                          | Body                                    | Returns |
|--------|-------------------------------|-----------------------------------------|---------|
| GET    | `/api/health`                 | —                                       | `{ ok, ts }` |
| POST   | `/api/gemini/generate-mcqs`   | `{ sourceText, sourceName, count }`     | `{ questions: [...] }` (strict JSON) |
| POST   | `/api/gemini/extract-names`   | `{ rawText }`                           | `{ names: [...] }` |
| POST   | `/api/gemini/study-guide`     | `{ wrongAnswers, studentName }`         | `{ summary }` (text-only Egyptian Arabic) |
| POST   | `/api/gemini/tutor`           | `{ history, userMessage, questionContext }` | `{ reply }` |
| POST   | `/api/moderation/check`       | `{ text }`                              | `{ flagged, match }` |

## Data architecture

### Firestore collections
- `allowed_students` — `{ name, ips: string[], loginCount, flagged }`
- `drafts` — generated MCQs awaiting review `{ question, options, correctIndex, explanation, topic, difficulty, colorTag, source }`
- `live_banks` — published MCQs (read by students)
- `exam_results` — `{ studentName, score, total, durationMs, answers: [...] }`
- `exam_feedback` — `{ studentName, rating, comment }`
- `activity_log` — `{ who, ip, action }`
- `banned_students` — `{ name, reason, ip }`
- `reports` — `{ by, against, reason }`
- `settings` — `{ maintenance: boolean }`

### Demo mode
If Firebase env vars are not set, the entire data layer transparently falls back to **localStorage** so the UI is fully usable without a backend (great for previewing).

## Setup — what YOU need to add

### 1. Firebase (frontend public config)
Create `/home/user/webapp/.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
Then publish proper Firestore security rules (this is the real security layer; the public config is fine in the browser).

### 2. Gemini key (server-side, never in browser)
For local dev create `/home/user/webapp/.dev.vars`:
```
GEMINI_API_KEY=your_key_here
```
For production:
```
npx wrangler pages secret put GEMINI_API_KEY --project-name <your-project>
```

### 3. Admin bypass credentials (already wired)
- Allowed names: `عمرو كارم محمود`, `محمد عبد الجواد`, `محمد فكري`, `محمود`
- Password: `nursing admins 123`

## Local development
```bash
cd /home/user/webapp
npm install --legacy-peer-deps
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000
pm2 logs tamrediano --nostream
```

## Deploy to Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy dist --project-name tamrediano
npx wrangler pages secret put GEMINI_API_KEY --project-name tamrediano
```

## Features not yet implemented
- Real-time multiplayer/leaderboard with WebSockets (Cloudflare Pages doesn't support persistent connections)
- Image upload UI for questions (R2 wiring) — questions support `imageUrl` but admin upload UI is not built
- CSV/Excel export of results (.txt is implemented; CSV is a small follow-up)
- Email notifications on auto-ban
- Per-topic deep analytics (current heatmap is per-question)

## Recommended next steps
1. Wire your Firebase project (`.env`) and run a smoke test login.
2. Set the Gemini secret (`.dev.vars` locally; `wrangler pages secret put` for prod).
3. Use the AI Name Extractor to seed `allowed_students` from your real cohort list.
4. Upload one nursing PDF to the Extraction Lab and review/publish ~20 MCQs as the first live bank.
5. Run a pilot exam with 3–5 students and watch the Analytics tab.
6. Lock down Firestore Security Rules — only the admin should be able to write to `live_banks`, `allowed_students`, `banned_students`, `settings`.

## Deployment status
- **Platform**: Cloudflare Pages + Pages Functions
- **Status**: ✅ Running locally on PM2 (port 3000)
- **Tech stack**: React 18, TypeScript, Tailwind CSS, Hono 4, Firebase 10, pdfjs-dist 4, Fuse.js 7
- **Last updated**: 2026-05-20
