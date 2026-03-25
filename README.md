# Waver Portfolio

A media-heavy portfolio site built with **Next.js 15**, **Supabase**, and **Cloudinary**. Features a justified-grid homepage with hover-to-play GIFs and videos, rich detail pages, and a protected admin CMS.

---

## Tech Stack

| Layer      | Technology                 |
| ---------- | -------------------------- |
| Framework  | Next.js 15 (App Router)    |
| Database   | Supabase (Postgres + Auth) |
| Media      | Cloudinary                 |
| Editor     | Novel (Tiptap-based)       |
| Styling    | Tailwind CSS v4            |
| Deployment | Vercel (recommended)       |

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier works)

---

## 1 — Clone & Install

```bash
git clone <your-repo-url>
cd waver-portfolio
npm install
```

---

## 2 — Supabase Setup

### 2a. Create a project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Give it a name, set a strong database password, choose a region close to you

### 2b. Run the setup SQL

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase/setup.sql` from this repo, paste the entire contents, and click **Run**

This single script creates:

- The `entries` table with all required columns
- Indexes for efficient sorting
- Row-Level Security (RLS) policies:
  - **Public/anonymous** users → read-only (powers the public portfolio)
  - **Authenticated** users → full insert / update / delete (admin only)

### 2c. Create your admin user

1. In Supabase go to **Authentication → Users → Add user**
2. Enter the email and password you will use to log in to `/admin`
3. That's the only account needed — the site uses Supabase's built-in email/password auth

### 2d. Get your API keys

In Supabase go to **Project Settings → API**:

| Key               | Environment variable            |
| ----------------- | ------------------------------- |
| Project URL       | `NEXT_PUBLIC_SUPABASE_URL`      |
| anon / public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

---

## 3 — Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) → **Dashboard**
2. Note your **Cloud name**, **API Key**, and **API Secret**
3. A folder called `waver-portfolio` will be created automatically on first upload

---

## 4 — Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> **Never commit `.env.local`** — it is already in `.gitignore`.

---

## 5 — Run Locally

```bash
npm run dev
```

- Public portfolio → [http://localhost:3000](http://localhost:3000)
- Admin CMS → [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 6 — Admin CMS Guide

| Path                         | What it does                       |
| ---------------------------- | ---------------------------------- |
| `/admin`                     | Lists all entries; drag to reorder |
| `/admin/entries/new`         | Create a new entry                 |
| `/admin/entries/[slug]/edit` | Edit an existing entry             |

### Entry fields

| Field                   | Notes                                                                         |
| ----------------------- | ----------------------------------------------------------------------------- |
| **Title**               | Displayed on the card and detail page                                         |
| **Slug**                | URL-safe identifier, auto-generated from title                                |
| **Description**         | Used for SEO meta tags and Open Graph social cards                            |
| **Category**            | Wave / Game / Music / Other — shown as a coloured pill on hover               |
| **Embedded Video Link** | YouTube, Vimeo, or Google Drive share URL — embedded on the detail page       |
| **Thumbnail**           | Upload an image, GIF, or video — determines grid card visual and aspect ratio |
| **Content**             | Rich-text / block editor (Novel/Tiptap) for the detail page body              |
| **Gallery Images**      | Shown in a justified grid at the bottom of the detail page                    |

### Reordering entries

1. Click **Reorder** (top-right of the entries list)
2. Drag the ⠿ grip handle to move entries up or down
3. Click **Save Order** to persist, or **Cancel** to discard

---

## 7 — Database Schema Reference

The full schema lives in `supabase/setup.sql`. Quick reference:

```sql
CREATE TABLE entries (
  id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                    TEXT        UNIQUE NOT NULL,
  title                   TEXT        NOT NULL,
  description             TEXT,
  thumbnail_id            TEXT        NOT NULL,   -- Cloudinary public_id
  thumbnail_resource_type TEXT        NOT NULL DEFAULT 'image',
  thumbnail_format        TEXT,                   -- e.g. 'gif'
  width                   INTEGER     NOT NULL DEFAULT 16,
  height                  INTEGER     NOT NULL DEFAULT 9,
  video_url               TEXT,                   -- YouTube / Vimeo / Drive URL
  category                TEXT        NOT NULL DEFAULT 'other',
  sort_order              INTEGER     NOT NULL DEFAULT 0,
  content_json            JSONB       NOT NULL DEFAULT '{}',
  gallery_ids             TEXT[]      NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### RLS Policies

| Role                     | SELECT | INSERT | UPDATE | DELETE |
| ------------------------ | ------ | ------ | ------ | ------ |
| `anon` (public visitors) | ✅     | ❌     | ❌     | ❌     |
| `authenticated` (admin)  | ✅     | ✅     | ✅     | ✅     |

---

## 8 — Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add all five environment variables from step 4 in the Vercel project settings
4. Deploy

> **Important:** In Supabase go to **Authentication → URL Configuration** and set the **Site URL** to your Vercel deployment URL (e.g. `https://your-site.vercel.app`). This ensures login redirects work correctly in production.

---

## 9 — Upgrading an Existing Database

If you set your database up manually before this script existed, re-run `supabase/setup.sql` — it contains `ALTER TABLE … ADD COLUMN IF NOT EXISTS` guards throughout, so it will safely add any missing columns without touching existing data.
