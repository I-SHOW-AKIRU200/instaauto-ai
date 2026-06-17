# InstaAuto AI

> AI-powered Instagram automation — generate and publish coding memes daily using DeepSeek-V3, Pollinations AI, and the Meta Graph API.

## Architecture

```
┌──────────┐   ┌───────────┐   ┌────────────┐   ┌───────────┐   ┌──────────┐
│DeepSeek  │   │Pollinations│   │UploadThing │   │Meta Graph │   │Instagram │
│  V3     │──▶│   AI      │──▶│  (CDN)    │──▶│   API     │──▶│  Feed    │
│(topic,   │   │(1080×1080 │   │(image     │   │(container │   │          │
│ caption, │   │ image)    │   │ hosting)   │   │ + publish)│   │          │
│ art)     │   │           │   │            │   │           │   │          │
└──────────┘   └───────────┘   └────────────┘   └───────────┘   └──────────┘
```

## Features

- **AI Content Generation** — DeepSeek-V3 generates meme topics, art prompts, and captions
- **AI Image Generation** — Pollinations AI creates 1080×1080 meme-style visuals
- **Image Hosting** — UploadThing CDN stores generated images
- **Scheduled Publishing** — Daily posts at your configured hour via Meta Graph API
- **Dashboard** — Full bento-grid UI with stats, gallery, activity log, and settings
- **Post Gallery** — View all generated posts with image previews and lightbox
- **Coding Memes** — Generates relatable programmer humor (configurable topic)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon.tech) |
| ORM | Prisma |
| AI | DeepSeek-V3 (via Hugging Face router) |
| Image Gen | Pollinations AI |
| Image CDN | UploadThing |
| API | Meta Graph API v22.0 |
| Auth | Direct Page Access Token (no OAuth) |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon.tech free tier recommended)
- Meta App (Facebook Developer)
- Hugging Face API token
- UploadThing account

### 1. Clone and install

```bash
git clone https://github.com/I-SHOW-AKIRU200/instaauto-ai.git
cd instaauto-ai
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Fill in all values — see CREDENTIALS.md for how to get each one
```

### 3. Push database schema

```bash
npx prisma db push
```

### 4. Seed Instagram config

```bash
npm run seed
```

### 5. Run

```bash
npm run build
npm start
```

Visit `http://localhost:3000/dashboard`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Stats overview, recent posts, gallery |
| `/posts` | Full post gallery with lightbox |
| `/logs` | Activity log with status and errors |
| `/settings` | Automation controls (topic, schedule, toggle) |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/cron/worker` | GET/POST | Main pipeline — triggers generation + publish |
| `/api/config` | GET | Fetch config and recent logs |
| `/api/config` | POST | Update prompt settings, schedule, active state |

## Deployment

### Production server

```bash
npm run build
npm start -p 3000
```

### Systemd service (optional)

```ini
[Unit]
Description=InstaAuto AI
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/instauto-ai
ExecStart=/usr/bin/npm start -- -p 3000
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Scheduled cron

The cron pipeline runs when hit via HTTP. Set up a cron job to call it at your configured hour:

```bash
# Example: run daily at 07:00 UTC (which = 10:00 UTC+3)
0 7 * * * curl -X POST http://localhost:3000/api/cron/worker -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Cloudflare Tunnel (for HTTPS)

```bash
npm install -g cloudflared
cloudflared tunnel --url http://localhost:3000
```

Set `NEXT_PUBLIC_APP_URL` to the tunnel URL.

## Environment Variables

See [CREDENTIALS.md](./CREDENTIALS.md) for detailed setup instructions for each service.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of your instance |
| `META_APP_ID` | Yes | Meta App ID (Facebook Developer) |
| `META_APP_SECRET` | Yes | Meta App Secret |
| `HF_API_TOKEN` | Yes | Hugging Face API token |
| `CRON_SECRET` | Yes | Random string to auth cron calls |
| `UPLOADTHING_TOKEN` | Yes | UploadThing API token |

## License

MIT
