<div align="center">

# 🛠️ Setup Guide

**InstaAuto AI — Step-by-step installation**

[![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-required-CB3837?style=flat-square&logo=npm)](https://www.npmjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

</div>

---

## 📋 Prerequisites

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | ≥ 18 LTS | `node -v` |
| npm | ≥ 9 | `npm -v` |
| Git | Any | `git --version` |
| PostgreSQL | ≥ 14 | — |

---

## 🚀 Step-by-step

### 1️⃣ Clone the repository

```bash
git clone https://github.com/I-SHOW-AKIRU200/instaauto-ai.git
cd instaauto-ai
```

### 2️⃣ Install dependencies

```bash
npm install
```

This runs `prisma generate` automatically via the `postinstall` script.

### 3️⃣ Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in every variable. See [CREDENTIALS.md](./CREDENTIALS.md) for detailed instructions on obtaining each credential.

**Required variables:**

| Variable | Example | Where to get it |
|----------|---------|-----------------|
| `DATABASE_URL` | `postgresql://...` | [Neon.tech](https://neon.tech) dashboard |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Your deployment URL |
| `META_APP_ID` | `123456789` | [Facebook Developers](https://developers.facebook.com) |
| `META_APP_SECRET` | `abc123...` | Facebook Developers → App Settings |
| `HF_API_TOKEN` | `hf_...` | [Hugging Face tokens](https://huggingface.co/settings/tokens) |
| `CRON_SECRET` | `openssl rand -hex 32` | Generate with `openssl rand -hex 32` |
| `UPLOADTHING_TOKEN` | `eyJ...` | [UploadThing](https://uploadthing.com) → API Keys |
| `INSTAGRAM_BUSINESS_ID` | *(optional)* | Instagram Biz ID for `npm run seed` |
| `PAGE_ACCESS_TOKEN` | *(optional)* | Page Access Token for `npm run seed` |

### 4️⃣ Set up the database

Create a PostgreSQL database (recommended: [Neon.tech free tier](https://neon.tech)) and paste the connection string into `DATABASE_URL`.

Push the Prisma schema:

```bash
npx prisma db push
```

Verify the tables were created:

```bash
npx prisma studio
```

### 5️⃣ Seed Instagram credentials

```bash
npm run seed
```

This script will prompt you for your **Instagram Business ID** and **Page Access Token**.

> 💡 **Need help finding these?** See [CREDENTIALS.md](./CREDENTIALS.md#instagram-business-id--page-access-token).

### 6️⃣ One-command deployment (recommended)

```bash
./scripts/startup.sh
```

This interactive script will:
- Ask for your **UTC offset** (e.g., `3` for UTC+3, `-5` for UTC-5)
- Ask for your desired **posting hour** (local time)
- Install dependencies and build the app
- Push the database schema
- Update the DB with your timezone and schedule
- Create a **systemd service** with auto-restart
- Add a **crontab entry** for daily pipeline trigger

### 7️⃣ Manual alternative

```bash
npm run build
npm start -p 3000 --hostname 0.0.0.0
```

---

## ⏰ Manual cron setup

If you skipped `startup.sh`, set up the cron job manually:

```bash
crontab -e
```

Replace `YOUR_CRON_SECRET` and calculate the UTC hour:

```bash
# Post at 10:00 UTC+3 → 07:00 UTC
# Formula: UTC_HOUR = (LOCAL_HOUR - UTC_OFFSET + 24) % 24
0 7 * * * curl -s -X POST http://localhost:3000/api/cron/worker \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

---

## 🌐 Cloudflare Tunnel (HTTPS)

Required if you need HTTPS for the Instagram API callbacks:

```bash
# Install
npm install -g cloudflared

# Run tunnel
cloudflared tunnel --url http://localhost:3000
```

Update `NEXT_PUBLIC_APP_URL` in `.env` to the tunnel URL.

---

## 🐳 Systemd service (manual)

```bash
sudo tee /etc/systemd/system/instauto-ai.service <<EOF
[Unit]
Description=InstaAuto AI
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/npm start -- -p 3000
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now instauto-ai
```

---

## 🩺 Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| **Database connection fails** | Neon free tier spun down | Wait 5s and retry. Add `?connect_timeout=10` to URL |
| **Pipeline fails: "Media container..."** | v22.0 removed status field | Already handled — pipeline uses fixed wait + retry |
| **UploadThing fails** | Token invalid/expired | Regenerate token in UploadThing dashboard |
| **DeepSeek returns errors** | HF token lacks access | Ensure token has access to `deepseek-ai/DeepSeek-V3` |
| **Instagram publish fails** | Container not ready | Pipeline retries 5× with 30s gaps |
| **Images not showing** | Pollinations still generating | First request takes 30-60s |

---

## 📚 Related Docs

| Document | Description |
|----------|-------------|
| [`CREDENTIALS.md`](./CREDENTIALS.md) | How to get every environment variable |
| [`AGENTS.md`](./AGENTS.md) | AI agent instructions for development |
| [`CLAUDE.md`](./CLAUDE.md) | Claude Code project context |
| [`.env.example`](./.env.example) | Environment variable template |
