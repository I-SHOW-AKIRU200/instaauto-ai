# CLAUDE.md — Claude Code Project Context

## Project

InstaAuto AI — Next.js 15 app that generates and posts coding memes to Instagram automatically.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm start          # Start production server (port 3000)
npm run seed       # Seed Instagram config into DB
npx prisma db push # Push schema changes to DB
npx prisma studio  # Open Prisma database UI
```

## Key Architecture

- `/api/cron/worker` — Main pipeline route. POST with `Authorization: Bearer {CRON_SECRET}`
- DeepSeek-V3 → Pollinations → UploadThing → Meta Graph API v22.0
- No OAuth — uses direct Page Access Token from DB seed
- 60s wait + retry publish loop for media containers (no status endpoint in v22.0)

## Database

Neon.tech PostgreSQL with Prisma. Schema in `prisma/schema.prisma`. Connection string in `DATABASE_URL`.

## Env Vars

See `.env.example`. All required: `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `META_APP_ID`, `META_APP_SECRET`, `HF_API_TOKEN`, `CRON_SECRET`, `UPLOADTHING_TOKEN`.

## Styling

Dark theme (`bg-neutral-950`), Tailwind v4, glassmorphism classes. No external icon libs — inline SVGs in `src/components/icons/`.
