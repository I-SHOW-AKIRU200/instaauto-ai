<div align="center">

# 🔑 CREDENTIALS.md

**How to obtain every environment variable for InstaAuto AI**

[![Meta](https://img.shields.io/badge/Meta-1877F2?style=flat-square&logo=meta)](https://developers.facebook.com/)
[![Neon](https://img.shields.io/badge/Neon-00E599?style=flat-square&logo=neon)](https://neon.tech/)
[![HuggingFace](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=flat-square&logo=huggingface)](https://huggingface.co/)
[![UploadThing](https://img.shields.io/badge/UploadThing-2563EB?style=flat-square)](https://uploadthing.com/)

</div>

---

## 📋 Overview

You need **7 environment variables** to run InstaAuto AI. This guide walks through getting each one.

---

## 1️⃣ `DATABASE_URL` — PostgreSQL Database

**Service:** [Neon.tech](https://neon.tech) (free serverless PostgreSQL)

```mermaid
flowchart LR
    A[Sign up at Neon] --> B[Create project]
    B --> C[Copy connection string]
    C --> D[Paste into .env]
```

### Steps

1. **Sign up** at [neon.tech](https://neon.tech) (GitHub login works)
2. **Create a new project** — any region
3. Copy the **connection string** from the dashboard:

```
postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

4. Paste as `DATABASE_URL` in `.env`

> 💡 The URL includes `?sslmode=require` — keep this for Neon.

---

## 2️⃣ `META_APP_ID` & `META_APP_SECRET` — Facebook App

**Service:** [Facebook Developers](https://developers.facebook.com)

```mermaid
flowchart LR
    A[Facebook Dev account] --> B[Create Business app]
    B --> C[Add Instagram Graph API]
    C --> D[Copy App ID & Secret]
```

### Steps

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. **Create a new app** → Choose **Business** type
3. In the dashboard, **Add Product** → **Instagram Graph API**
4. Go to **Settings → Basic**
5. Copy **App ID** → `META_APP_ID`
6. Click **Show** → Copy **App Secret** → `META_APP_SECRET`

### Required Permissions

| Permission | Purpose |
|------------|---------|
| `instagram_basic` | Read Instagram account info |
| `instagram_content_publish` | Publish posts |
| `pages_show_list` | List Facebook pages |
| `pages_read_engagement` | Read page engagement data |

> **Note:** The app can stay in **Development mode**. OAuth is not used.

---

## 3️⃣ `HF_API_TOKEN` — Hugging Face

**Service:** [Hugging Face](https://huggingface.co)

### Steps

1. **Sign up** at [huggingface.co](https://huggingface.co/join)
2. Go to **Settings → [Access Tokens](https://huggingface.co/settings/tokens)**
3. Click **New token**
4. Choose **Read** role
5. Copy the token (starts with `hf_`)
6. Paste as `HF_API_TOKEN` in `.env`

This token authenticates requests to DeepSeek-V3 via Hugging Face's inference router.

---

## 4️⃣ `CRON_SECRET` — Cron Authentication

**Purpose:** Authenticates cron job HTTP requests to the pipeline endpoint.

### Generate

```bash
openssl rand -hex 32
```

**Example output:**

```
787b60cc0b5f9d109d53335f6f68fcbf22a51859454d08fe939dbde38284c16a
```

Paste the output as `CRON_SECRET` in `.env`.

> 🔒 Use a different random value for production.

---

## 5️⃣ `UPLOADTHING_TOKEN` — UploadThing

**Service:** [UploadThing](https://uploadthing.com) (image CDN)

### Steps

1. **Sign up** at [uploadthing.com](https://uploadthing.com)
2. Create a **new app**
3. Go to **Settings → API Keys**
4. Copy the token (a JWT starting with `eyJ...`)
5. Paste as `UPLOADTHING_TOKEN` in `.env`

UploadThing stores generated images before passing them to Instagram.

---

## 6️⃣ `NEXT_PUBLIC_APP_URL` — Public URL

| Environment | Value |
|-------------|-------|
| **Local dev** | `http://localhost:3000` |
| **Production** | `https://yourdomain.com` |
| **Tunnel** | `https://xxxxx.trycloudflare.com` |

---

## 7️⃣ Instagram Business ID & Page Access Token

These are seeded **directly into the database** (not in `.env`).

### Page Access Token (never expires)

```mermaid
flowchart LR
    A[Graph API Explorer] --> B[Select app + Page token]
    B --> C[Copy token]
```

1. Go to [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Select your app
3. **Add permissions:** `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`
4. Get a **Page Access Token**
5. It will have `expires_at: 0` (never expires for Pages with certain configs)

### Instagram Business ID

```bash
# 1. Find your Facebook Page ID
curl -s "https://graph.facebook.com/v22.0/me/accounts?access_token=PAGE_TOKEN"

# 2. Find linked Instagram Business Account
curl -s "https://graph.facebook.com/v22.0/PAGE_ID?fields=instagram_business_account&access_token=PAGE_TOKEN"
```

The `id` in the response is your **Instagram Business ID**.

### Seed into database

```bash
npm run seed
```

Follow the prompts to enter the Business ID and Page Access Token.

---

## 🎯 Quick Reference Card

| # | Variable | Where | Format | Priority |
|---|----------|-------|--------|----------|
| ① | `DATABASE_URL` | [Neon dashboard](https://neon.tech) | `postgresql://...` | ✅ Required |
| ② | `META_APP_ID` | [Facebook Dev](https://developers.facebook.com) | Numeric string | ✅ Required |
| ③ | `META_APP_SECRET` | Facebook Dev → Settings | Alphanumeric | ✅ Required |
| ④ | `HF_API_TOKEN` | [HF tokens page](https://huggingface.co/settings/tokens) | `hf_...` | ✅ Required |
| ⑤ | `CRON_SECRET` | `openssl rand -hex 32` | Hex string | ✅ Required |
| ⑥ | `UPLOADTHING_TOKEN` | [UploadThing API Keys](https://uploadthing.com) | `eyJ...` (JWT) | ✅ Required |
| ⑦ | `NEXT_PUBLIC_APP_URL` | Your deployment URL | `http://...` | ✅ Required |
| ⑧ | Instagram Business ID | Graph API query | Numeric string | In DB seed |
| ⑨ | Page Access Token | Graph API Explorer | Long string | In DB seed |

---

## 🔐 Security Notes

- **Never commit `.env` to Git** — it's in `.gitignore`
- Page Access Token with `expires_at: 0` **should not expire** but verify periodically
- The `CRON_SECRET` should be unique per deployment
- Rotate tokens if they're ever exposed

---

## 📚 Related Docs

| Doc | Description |
|-----|-------------|
| [`SETUP.md`](./SETUP.md) | Full installation guide |
| [`AGENTS.md`](./AGENTS.md) | AI agent instructions |
| [`.env.example`](./.env.example) | Environment template |
