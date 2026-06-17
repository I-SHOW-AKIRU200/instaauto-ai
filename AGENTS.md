# AGENTS.md — Instructions for AI Agents

## Project Overview

InstaAuto AI is a Next.js 15 SaaS app that autonomously generates and posts coding memes to Instagram daily.

## Key Files

- `src/app/api/cron/worker/route.ts` — Main pipeline: DeepSeek → Pollinations → UploadThing → Meta API
- `src/lib/deepseek.ts` — AI topic/art/caption generation
- `src/lib/meta.ts` — Meta Graph API helpers (create container, publish)
- `src/lib/uploadthing.ts` — UploadThing server-side upload
- `src/lib/pollinations.ts` — Build Pollinations image URL
- `src/lib/types.ts` — Shared TypeScript types
- `prisma/schema.prisma` — Database models (User, InstagramConfig, PostLog)
- `prisma/seed.ts` — Seeds Instagram Business ID + Page Access Token
- `src/app/dashboard/page.tsx` — Dashboard UI
- `src/components/Sidebar.tsx` — Navigation sidebar

## Architecture Rules

1. **Graph API v22.0**: `status` and `error_message` fields are NOT available on media container GET endpoints. Do NOT use `checkMediaContainerStatus`. Use a fixed 60s wait + publish retry loop instead.
2. **Direct token auth**: No OAuth flow — app is unpublished. Use direct Page Access Token seeded via `prisma/seed.ts`.
3. **UploadThing**: Images are stored on UploadThing CDN before being passed to Instagram.
4. **Pollinations**: Takes 30-60s to generate. URL format: `https://image.pollinations.ai/prompt/{prompt}?width=1080&height=1080&nologo=true&seed={timestamp}`
5. **Cron pipeline timeout**: 300s (5 min). If it takes longer, adjust timeout.

## Database Models

- **InstagramConfig**: `id`, `userId`, `instagramBusinessId`, `pageAccessToken`, `systemTokenStatus`, `promptSettings`, `scheduleHour`, `lastPostedAt`, `isActive`
- **PostLog**: `id`, `configId`, `topicTitle`, `captionGenerated`, `imageUrl`, `status`, `errorMessage`, `postedAt`

## CRON_SECRET

`787b60cc0b5f9d109d53335f6f68fcbf22a51859454d08fe939dbde38284c16a`

## Styling

- Liquid Glass dark theme (`bg-neutral-950`)
- Custom CSS classes: `glass-card`, `glass-input`, `glass-select`, `bg-radial-gradient`
- Inline SVG icons in `src/components/icons/`
- Animations: `animate-slide-up`, `animate-scale-in`, `animate-pulse-glow`, `animate-float`

## Deployment

- Production: `npm run build && npm start -p 3000`
- Cron: hit `/api/cron/worker` with `Authorization: Bearer {CRON_SECRET}` header
- Server runs on `http://0.0.0.0:3000`
