<div align="center">

# 🧭 AGENTS.md

**Instructions for AI Agents working on InstaAuto AI**

[![OpenCode](https://img.shields.io/badge/OpenCode-Compatible-4F46E5?style=flat-square)](https://opencode.ai)
[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Graph API v22.0](https://img.shields.io/badge/Graph%20API-v22.0-1877F2?style=flat-square&logo=meta)](https://developers.facebook.com/)

</div>

---

## 📋 Project Overview

**InstaAuto AI** — Next.js 15 SaaS app that autonomously generates and posts **coding memes** to Instagram daily.

**Pipeline:** `DeepSeek-V3 → Pollinations AI → UploadThing CDN → Meta Graph API v22.0`

---

## 🗂️ Key Files

### Core Pipeline

| File | Purpose |
|------|---------|
| `src/app/api/cron/worker/route.ts` | Main pipeline orchestration |
| `src/lib/deepseek.ts` | AI topic / art prompt / caption generation |
| `src/lib/meta.ts` | Meta Graph API helpers (create container, publish) |
| `src/lib/uploadthing.ts` | UploadThing server-side file upload |
| `src/lib/pollinations.ts` | Build Pollinations image generation URL |
| `src/lib/types.ts` | Shared TypeScript interfaces |

### Database

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Schema: `User`, `InstagramConfig`, `PostLog` |
| `prisma/seed.ts` | Seeds Instagram Business ID + Page Access Token |

### Frontend

| File | Purpose |
|------|---------|
| `src/app/dashboard/page.tsx` | Main dashboard with bento-grid layout |
| `src/app/posts/page.tsx` | Post gallery with lightbox |
| `src/app/logs/page.tsx` | Activity log |
| `src/app/settings/page.tsx` | Automation settings |
| `src/components/Sidebar.tsx` | Navigation sidebar with active states |

---

## 🏗️ Architecture Rules

> **⚠️ CRITICAL — Do NOT violate these rules**

### 1. Graph API v22.0 Limitations

```typescript
// ❌ DO NOT USE — These fields do NOT exist in v22.0
const status = container.status;          // field removed
const error = container.error_message;    // field removed

// ✅ DO THIS INSTEAD — Fixed wait + retry loop
await sleep(60000);                       // wait for processing
// Retry publish up to 5 times, 30s apart
```

**`status` and `error_message` fields are NOT available on media container GET endpoints.** Do NOT use `checkMediaContainerStatus`. Use a fixed 60s wait + publish retry loop instead.

### 2. Authentication

```typescript
// ❌ Do NOT implement OAuth flow
// ✅ Use direct Page Access Token from database seed
const config = await prisma.instagramConfig.findFirst();
// config.pageAccessToken — already seeded
```

**No OAuth flow** — app is unpublished. Use direct Page Access Token seeded via `prisma/seed.ts`.

### 3. Image Pipeline

```typescript
// Pollinations URL format:
const url = `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1080&nologo=true&seed=${Date.now()}`;
// Takes 30-60s to generate

// Always upload to UploadThing before passing to Instagram
const cdnUrl = await uploadImageFromUrl(pollinationsUrl, fileName);
// Use cdnUrl in createMediaContainer(), NOT the raw Pollinations URL
```

**UploadThing** stores images before Instagram. Pollinations URLs are ephemeral.

### 5. Timezone Handling

```typescript
// Each config has a timezoneOffset (stored in DB)
// The worker matches configs by converting UTC → local hour
const offset = config.timezoneOffset ?? 3;
const localHour = (currentHour + offset + 24) % 24;
if (localHour === config.scheduleHour) { /* process */ }
```

**No hardcoded offsets** — each config uses its own `timezoneOffset`.

---

### 6. Deployment

Use `scripts/startup.sh` for first-time deployment:

```bash
./scripts/startup.sh
```

It asks for your UTC offset and posting hour, then sets up systemd + crontab automatically.

---

### 7. Timeouts

| Operation | Expected Time | Notes |
|-----------|--------------|-------|
| DeepSeek-V3 call | ~5-10s | Via Hugging Face router |
| Pollinations generation | 30-60s | First request creates the image |
| UploadThing upload | ~3-5s | Depends on image size |
| Media container creation | ~2s | Meta API creates container |
| Media processing wait | **60s** | Fixed wait (no status endpoint) |
| Publish (with retries) | up to 150s | 5 retries × 30s apart |
| **Total** | **~300s (5 min)** | Match timeout to this |

---

## 🗄️ Database Models

### InstagramConfig

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` (cuid) | Primary key |
| `userId` | `String` | FK → User |
| `instagramBusinessId` | `String` | Instagram Business Account ID |
| `pageAccessToken` | `String` | Facebook Page Access Token |
| `systemTokenStatus` | `String` | `"active"` by default |
| `promptSettings` | `String` | Topic for content generation |
| `scheduleHour` | `Int` | Hour in local timezone (0-23) |
| `timezoneOffset` | `Int` | UTC offset (e.g., 3 for UTC+3, -5 for UTC-5) |
| `lastPostedAt` | `DateTime?` | Last successful post |
| `isActive` | `Boolean` | Automation toggle |

### PostLog

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` (cuid) | Primary key |
| `configId` | `String` | FK → InstagramConfig |
| `topicTitle` | `String` | Generated meme title |
| `captionGenerated` | `String?` | Full caption with hashtags |
| `imageUrl` | `String?` | UploadThing CDN URL |
| `status` | `String` | `SUCCESS` / `FAILED` / `PENDING` |
| `errorMessage` | `String?` | Error details on failure |
| `postedAt` | `DateTime` | When logged |

---

## 🔐 CRON_SECRET

```text
787b60cc0b5f9d109d53335f6f68fcbf22a51859454d08fe939dbde38284c16a
```

Used for `Authorization: Bearer {CRON_SECRET}` header on `/api/cron/worker`.

---

## 🎨 Styling Conventions

### Theme

| Token | Value |
|-------|-------|
| Background | `bg-neutral-950` (#09090b) |
| Glass card | `glass-card` class |
| Input | `glass-input` class |
| Select | `glass-select` class |
| Gradient bg | `bg-radial-gradient` / `bg-radial-gradient-right` |
| Gradient text | `text-gradient` / `text-gradient-success` |
| Animations | `animate-slide-up`, `animate-scale-in`, `animate-pulse-glow`, `animate-float` |

### Icons

- All icons are **inline SVG components** in `src/components/icons/`
- No external icon libraries (no Heroicons, Lucide, etc.)
- Each icon accepts `className` prop for sizing/coloring

### Layout

- **Sidebar** is fixed `w-64` on the left, main content `pl-64`
- Pages use `max-w-7xl mx-auto` wrapper
- Bento grid uses `grid grid-cols-1 lg:grid-cols-3 gap-6`

---

## 🚀 Deployment

```bash
# One-command setup (recommended)
./scripts/startup.sh

# Manual
npm run build
npm start -p 3000 --hostname 0.0.0.0

# Cron trigger
curl -X POST http://localhost:3000/api/cron/worker \
  -H "Authorization: Bearer {CRON_SECRET}"
```

---

## 📚 Related Docs

| Doc | Purpose |
|-----|---------|
| [`SETUP.md`](./SETUP.md) | Step-by-step installation guide |
| [`CREDENTIALS.md`](./CREDENTIALS.md) | How to get each env var |
| [`CLAUDE.md`](./CLAUDE.md) | Claude Code project context |
| [`.env.example`](./.env.example) | Environment variable template |
