<div align="center">

# 🤖 CLAUDE.md

**Claude Code Project Context — InstaAuto AI**

[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

</div>

---

## 📋 Project

**InstaAuto AI** — Next.js 15 app that generates and posts **coding memes** to Instagram automatically.

**Pipeline:** `DeepSeek-V3 → Pollinations AI → UploadThing CDN → Meta Graph API v22.0`

---

## 🛠️ Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm start                # Start production server
npm run seed             # Seed Instagram config into DB
npm run lint             # Run Next.js lint
npx prisma db push       # Push schema changes to DB
npx prisma studio        # Open Prisma database UI
npx prisma generate      # Regenerate Prisma Client
./scripts/startup.sh     # Interactive deployment (systemd + crontab + timezone)
```

---

## 🏗️ Key Architecture

| Component | Location | Description |
|-----------|----------|-------------|
| Pipeline route | `src/app/api/cron/worker/route.ts` | Main cron handler |
| Config API | `src/app/api/config/route.ts` | GET/POST config & logs |
| DeepSeek | `src/lib/deepseek.ts` | Caption/prompt generation |
| Meta API | `src/lib/meta.ts` | Container create + publish |
| Pollinations | `src/lib/pollinations.ts` | Image URL builder |
| UploadThing | `src/lib/uploadthing.ts` | File upload helper |
| Dashboard | `src/app/dashboard/page.tsx` | Main UI |
| Sidebar | `src/components/Sidebar.tsx` | Navigation |
| Schema | `prisma/schema.prisma` | DB models |
| Seed | `prisma/seed.ts` | Instagram config seeder |

---

## ⚠️ Critical Rules

### Graph API v22.0

```typescript
// ❌ NOT available in v22.0:
const status = container.status;          // field removed
const error = container.error_message;    // field removed

// ✅ Use fixed wait + retry instead:
await sleep(60000);
// Retry publish up to 5 times, 30s apart
```

### Authentication

- **No OAuth** — app is unpublished in Facebook
- Uses **direct Page Access Token** from `prisma/seed.ts`
- Token stored in `InstagramConfig.pageAccessToken`

### Pipeline Flow

1. `generateTopic()` → `generateArtPrompt()` → `generateCaption()`
2. `buildPollinationsUrl()` → generate 1080×1080 comic-style image
3. `uploadImageFromUrl()` → UploadThing CDN
4. `createMediaContainer()` → wait 60s → `publishMediaContainer()`

### Timezone Handling

- Each config has a `timezoneOffset` (e.g., 3 for UTC+3)
- Worker converts UTC hour to local hour using per-config offset
- Cron matches against `scheduleHour` in local time

---

## 🗄️ Database

- **Provider:** Neon.tech (PostgreSQL)
- **ORM:** Prisma 6
- **Connection:** `DATABASE_URL` env var
- **Models:** `User`, `InstagramConfig`, `PostLog`

---

## 🔐 Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL (local or tunnel) |
| `META_APP_ID` | ✅ | Facebook App ID |
| `META_APP_SECRET` | ✅ | Facebook App Secret |
| `HF_API_TOKEN` | ✅ | Hugging Face API token |
| `CRON_SECRET` | ✅ | Random hex for cron auth |
| `UPLOADTHING_TOKEN` | ✅ | UploadThing API token |

---

## 🎨 Styling

| Detail | Value |
|--------|-------|
| Theme | Dark (`bg-neutral-950`) |
| Framework | Tailwind CSS v4 |
| Glass cards | `glass-card` class (CSS in `globals.css`) |
| Icons | Inline SVG in `src/components/icons/` |
| Animations | `animate-slide-up`, `animate-scale-in` |
| Layout | Sidebar `w-64` fixed, content `pl-64` |

---

## 📚 Related Files

- [SETUP.md](./SETUP.md) — Installation guide
- [CREDENTIALS.md](./CREDENTIALS.md) — Env var setup
- [AGENTS.md](./AGENTS.md) — Full AI agent instructions
- [.env.example](./.env.example) — Env template
