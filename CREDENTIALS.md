# Credentials Guide

How to get each environment variable needed to run InstaAuto AI.

---

## `DATABASE_URL` — PostgreSQL Database

**Recommended:** [Neon.tech](https://neon.tech) (free tier, serverless PostgreSQL)

1. Sign up at https://neon.tech
2. Create a new project (choose any region)
3. Copy the connection string — it looks like:
   ```
   postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
   ```
4. Paste as `DATABASE_URL` in `.env`

---

## `META_APP_ID` & `META_APP_SECRET` — Meta App

**Required:** Facebook Developer account

1. Go to https://developers.facebook.com
2. Create a new app (choose "Business" type)
3. Go to **Settings → Basic**
4. Copy **App ID** → `META_APP_ID`
5. Copy **App Secret** → `META_APP_SECRET`
6. Add the **Instagram Graph API** product to your app
7. In Instagram Graph API settings, add your Instagram Account (must be a Business/Creator account)

> **Note:** The app can stay in Development mode. OAuth is not used — authentication is via direct Page Access Token.

---

## `HF_API_TOKEN` — Hugging Face

1. Sign up at https://huggingface.co
2. Go to https://huggingface.co/settings/tokens
3. Create a new token (Read role is sufficient)
4. Copy the token (starts with `hf_`)
5. Paste as `HF_API_TOKEN` in `.env`

This token is used to access DeepSeek-V3 via Hugging Face's inference router.

---

## `CRON_SECRET` — Cron Authentication

This is a random string used to authenticate cron job calls.

Generate one:

```bash
openssl rand -hex 32
# Example output: 787b60cc0b5f9d109d53335f6f68fcbf22a51859454d08fe939dbde38284c16a
```

Paste as `CRON_SECRET` in `.env`.

---

## `UPLOADTHING_TOKEN` — UploadThing

1. Sign up at https://uploadthing.com
2. Create a new app
3. Go to **Settings → API Keys**
4. Copy the token
5. Paste as `UPLOADTHING_TOKEN` in `.env`

UploadThing is used to store generated images before passing them to Instagram.

---

## Instagram Business ID & Page Access Token

These are seeded into the database (not in `.env`).

### Page Access Token (never expires)

1. Go to https://developers.facebook.com/tools/explorer
2. Select your app
3. Get a **Page Access Token** with these permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
4. Copy the token

### Instagram Business ID

1. Make a GET request to:
   ```
   GET /me/accounts?access_token={PAGE_ACCESS_TOKEN}
   ```
   Find your Page ID.

2. Then:
   ```
   GET /{PAGE_ID}?fields=instagram_business_account&access_token={PAGE_ACCESS_TOKEN}
   ```
   The `id` field is your Instagram Business ID.

3. Run the seed script:
   ```bash
   npx tsx prisma/seed.ts
   ```
   Follow the prompts to enter Business ID and Page Access Token.

---

## `NEXT_PUBLIC_APP_URL` — Public URL

- **Local development:** `http://localhost:3000`
- **Production:** Your domain or Cloudflare tunnel URL (e.g., `https://your-tunnel.trycloudflare.com`)
- Used for UploadThing webhook callbacks and (optionally) OAuth redirects

---

## Quick Reference

| Variable | Where to get it | Format |
|----------|----------------|--------|
| `DATABASE_URL` | Neon.tech project dashboard | `postgresql://...` |
| `META_APP_ID` | Facebook Developer → App Settings | Numeric string |
| `META_APP_SECRET` | Facebook Developer → App Settings | Alphanumeric string |
| `HF_API_TOKEN` | Hugging Face → Settings → Tokens | `hf_...` |
| `CRON_SECRET` | Generate with `openssl rand -hex 32` | Hex string |
| `UPLOADTHING_TOKEN` | UploadThing → App → API Keys | `eyJ...` (JWT) |
| `NEXT_PUBLIC_APP_URL` | Your deployment URL | URL string |
