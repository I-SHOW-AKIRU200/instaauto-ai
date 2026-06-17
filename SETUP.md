# Setup Guide

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm
- Git
- A PostgreSQL database (Neon.tech free tier works great)

## Step-by-step

### 1. Clone the repository

```bash
git clone https://github.com/I-SHOW-AKIRU200/instaauto-ai.git
cd instaauto-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in every variable in `.env`. See [CREDENTIALS.md](./CREDENTIALS.md) for instructions on obtaining each one.

### 4. Set up the database

Create a PostgreSQL database (e.g., on [Neon.tech](https://neon.tech)) and paste the connection string into `DATABASE_URL` in `.env`.

Push the schema:

```bash
npx prisma db push
```

### 5. Seed Instagram credentials

Run the seed script with your Instagram Business ID and Page Access Token:

```bash
npx tsx prisma/seed.ts
```

Alternatively, set the values via environment variables when running the seed (check the seed script for details).

### 6. Build and run

```bash
npm run build
npm start -p 3000
```

Visit `http://localhost:3000/dashboard`

### 7. Set up the cron job

The pipeline is triggered by hitting the cron endpoint. Add a crontab entry:

```bash
# Edit crontab
crontab -e

# Run daily at 07:00 UTC
0 7 * * * curl -X POST http://localhost:3000/api/cron/worker -H "Authorization: Bearer YOUR_CRON_SECRET" -H "Content-Type: application/json"
```

### 8. (Optional) HTTPS with Cloudflare Tunnel

```bash
npm install -g cloudflared
cloudflared tunnel --url http://localhost:3000
```

Update `NEXT_PUBLIC_APP_URL` in `.env` to the tunnel URL.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection fails | Check `DATABASE_URL` format. Neon free tier spins down after inactivity — wait ~5s and retry. |
| Pipeline fails with media container error | The `status` field is not available in Graph API v22.0. The pipeline waits 60s then retries publish. |
| UploadThing upload fails | Check `UPLOADTHING_TOKEN` is valid and not expired. |
| DeepSeek returns errors | Verify `HF_API_TOKEN` has access to DeepSeek-V3 model. |
| Pollinations image not loading | The first request takes 30-60s to generate. Instagram's download may timeout — retry. |
