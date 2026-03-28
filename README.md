# Waver Portfolio

A media-heavy portfolio site built with **Next.js 15**, **Supabase**, and **Cloudinary**. Features a justified-grid homepage with hover-to-play GIFs and videos, rich detail pages, and a protected admin CMS.

---

## What You Will Need

Before you start, create free accounts on all four of these services. You will not need a credit card for any of them.

| Service                              | What it does                    | Free tier                 |
| ------------------------------------ | ------------------------------- | ------------------------- |
| [GitHub](https://github.com)         | Hosts your code (public repo)   | ✅ Unlimited public repos |
| [Vercel](https://vercel.com)         | Hosts and runs the Next.js app  | ✅ Hobby plan             |
| [Supabase](https://supabase.com)     | Postgres database + login auth  | ✅ 2 free projects        |
| [Cloudinary](https://cloudinary.com) | Stores and serves images/videos | ✅ 25 GB free             |

---

## Overview

The full setup has six stages. Follow them in order.

1. Personalize your site content
2. Get the code onto GitHub
3. Set up Supabase (database + auth)
4. Set up Cloudinary (media storage)
5. Deploy to Vercel (connect everything)
6. Run locally for development

---

## A Note on Secrets vs. Personal Content

**Secrets (API keys, database passwords):** None of these are stored in the source code. They live only in your `.env.local` file locally, and in Vercel's Environment Variables for production. `.env.local` is already in `.gitignore` — it cannot accidentally be committed.

**Personal content (your name, bio, links):** These _are_ in source files, which will be public once you push to GitHub. That is fine — they are just text, not credentials. Stage 1 below tells you exactly which files to edit.

---

## Stage 1 — Personalize Your Site

Before pushing to GitHub, update these files with your own information. They currently contain placeholder text.

### 1a. Your Name and Tagline — `src/app/page.tsx`

Open `src/app/page.tsx` and update the two sections near the top of the `return` block:

```tsx
<SiteHeader name="Your Name" />
<SiteDescription>
  Your tagline or description goes here.
</SiteDescription>
```

### 1b. Social Links — `src/lib/data/homeLinks.ts`

Open `src/lib/data/homeLinks.ts` and update each `link:` value with your own URLs.

- **Remove** any entry for a platform you don't use by deleting it from the array.
- **Add** a new entry by copying the pattern and importing a new icon from `react-icons/fa`. Browse available icons at [react-icons.github.io/react-icons](https://react-icons.github.io/react-icons/).

### 1c. Site Title and Meta Description — `src/app/layout.tsx`

Open `src/app/layout.tsx` and update the `metadata` object:

```ts
export const metadata: Metadata = {
  title: "Your Name — Portfolio",
  description: "Short description of what you do",
};
```

### 1d. (Optional) Cloudinary Upload Folder — `src/app/actions.ts`

By default, all your uploads go into a Cloudinary folder called `waver-portfolio`. To use a different folder name, open `src/app/actions.ts` and search for `"waver-portfolio"` — change it to anything you like. (This only affects how files are organized inside Cloudinary — it has no effect on the site itself.)

---

## Stage 2 — Get the Code onto GitHub

### 2a. Fork or use this template

- If this repo is a template: click **Use this template → Create a new repository**
- Otherwise: click **Fork** (top-right on GitHub)
- Choose a name for your repo, set visibility to **Public**, and click **Create**

### 2b. Clone it to your machine

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
npm install
```

> You need [Node.js 18 or higher](https://nodejs.org). Check with `node -v`. I'm using 22.13.1

### 2c. Important — never commit secrets

The `.env.local` file (created in Stage 6) is already listed in `.gitignore` so it will never be uploaded to GitHub. **Never remove it from `.gitignore`.**

---

## Stage 3 — Supabase Setup

### 3a. Create a project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**
3. Fill in a project name, set a strong database password (save it somewhere), and choose the region closest to you
4. Click **Create new project** and wait ~2 minutes for it to provision

### 3b. Run the database setup script

This repo includes a single SQL script that creates your entire database from scratch.

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. On your computer, open the file `supabase/setup.sql` from this repo
4. Select all the text, copy it, and paste it into the Supabase SQL editor
5. Click **Run** (or press Ctrl+Enter)

You should see a table of columns at the bottom confirming success.

**What the script sets up:**

- The `entries` table with every required column
- A sort index for efficient ordering
- Row-Level Security (RLS) so the public can only read data, and only logged-in admins can create, edit, or delete entries

### 3c. Create your admin login

1. In Supabase, click **Authentication** in the left sidebar
2. Click **Users → Add user → Create new user**
3. Enter an email address and a strong password — this is what you will use to log in to `/admin`
4. Click **Create user**

> This is the only account you need. There is no public sign-up — only you can log in.

### 3d. Copy your Supabase API keys

1. In Supabase, click **Project Settings** (gear icon, bottom-left)
2. Click **API** in the settings menu
3. You need two values — copy them somewhere safe:

| Value to copy                                    | You will use it as              |
| ------------------------------------------------ | ------------------------------- |
| **Project URL**                                  | `NEXT_PUBLIC_SUPABASE_URL`      |
| **anon / public** key (under "Project API keys") | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

> The `anon` key is safe to expose publicly — it only works because RLS policies control what it can access.

---

## Stage 4 — Cloudinary Setup

Cloudinary stores and serves all the images, GIFs, and videos you upload through the admin.

### 4a. Create an account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up
2. You will land on the **Dashboard**

### 4b. Copy your credentials

On the Dashboard you will see a box called **Product Environment Credentials**. Copy all three values:

| Value to copy  | You will use it as                  |
| -------------- | ----------------------------------- |
| **Cloud name** | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |
| **API Key**    | `CLOUDINARY_API_KEY`                |
| **API Secret** | `CLOUDINARY_API_SECRET`             |

> The API Secret is sensitive — treat it like a password. Never put it in code or commit it to GitHub.

### 4c. (Optional) Configure upload settings

The app automatically creates a folder in your Cloudinary account on the first upload. By default the folder is called `waver-portfolio` — see Stage 1d above if you want to rename it.

---

## Stage 5 — Deploy to Vercel

Vercel reads your code from GitHub and hosts the app. This is also where you safely store all your secret keys.

### 5a. Create a Vercel account

1. Go to [vercel.com](https://vercel.com) and click **Sign Up**
2. Choose **Continue with GitHub** — this links your accounts so Vercel can see your repos

### 5b. Import your repository

1. On the Vercel dashboard click **Add New… → Project**
2. Find your repository in the list and click **Import**
3. Leave all the build settings as-is (Vercel detects Next.js automatically)
4. **Before clicking Deploy**, scroll down to **Environment Variables**

### 5c. Add your environment variables to Vercel

Add each of the five variables below. Click **Add** after each one.

| Name                                | Value                         |
| ----------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`          | Your Supabase Project URL     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Your Supabase anon/public key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name    |
| `CLOUDINARY_API_KEY`                | Your Cloudinary API key       |
| `CLOUDINARY_API_SECRET`             | Your Cloudinary API secret    |

> Make sure all five are entered before deploying. You can add or edit them later under **Project Settings → Environment Variables**, but you will need to redeploy after any change.

### 5d. Deploy

Click **Deploy**. Vercel will build and publish your site. This takes about 1–2 minutes.

When it finishes, Vercel gives you a URL like `https://your-project-name.vercel.app`. Copy it.

### 5e. Tell Supabase your live URL

Supabase needs to know your production URL so that login redirects work correctly.

1. Go back to your Supabase project
2. Click **Authentication** → **URL Configuration**
3. Set **Site URL** to your Vercel URL: `https://your-project-name.vercel.app`
4. Click **Save**

Your site is now live.

---

## Stage 6 — Run Locally (for Development)

To work on the code on your own machine, you need a local copy of all the environment variables.

### 6a. Create `.env.local`

In the root of your project, create a file called `.env.local` and paste in the following, filling in your real values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

> This file is already in `.gitignore`. It will never be uploaded to GitHub. Keep it private.

### 6b. Start the dev server

```bash
npm run dev
```

| URL                                                        | What you see        |
| ---------------------------------------------------------- | ------------------- |
| [http://localhost:3000](http://localhost:3000)             | Public portfolio    |
| [http://localhost:3000/admin](http://localhost:3000/admin) | Admin login and CMS |

---

## Using the Admin CMS

Log in at `/admin` with the email and password you created in Supabase.

| Path                         | What it does                       |
| ---------------------------- | ---------------------------------- |
| `/admin`                     | Lists all entries; drag to reorder |
| `/admin/entries/new`         | Create a new entry                 |
| `/admin/entries/[slug]/edit` | Edit an existing entry             |

### Entry fields

| Field                   | Notes                                                                           |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Title**               | Displayed on the grid card and the detail page                                  |
| **Slug**                | The URL path (e.g. `my-project` → `/my-project`), auto-generated from the title |
| **Description**         | Used for SEO and social media preview cards                                     |
| **Category**            | Wave / Game / Music / Other — shows as a colour-coded pill on hover             |
| **Embedded Video Link** | YouTube, Vimeo, or Google Drive share URL — embedded on the detail page         |
| **Thumbnail**           | Upload an image, GIF, or video — this is what shows in the grid                 |
| **Content**             | Rich-text body for the detail page (supports headings, images, video, etc.)     |
| **Gallery Images**      | Additional images shown in a justified grid at the bottom of the detail page    |

### Reordering entries

1. Click **Reorder** (top-right of the entries list)
2. Drag the ⠿ grip handle to move entries up or down
3. Click **Save Order** to persist, or **Cancel** to discard

---

## Publishing Updates

After making any code changes locally:

```bash
git add .
git commit -m "describe your change"
git push
```

Vercel automatically detects the push and redeploys within about a minute. No manual steps needed.

If you add a new environment variable, go to **Vercel → Project Settings → Environment Variables**, add it there, then trigger a redeploy from the Vercel dashboard.

---

## Database Schema Reference

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

### Who can do what (RLS policies)

| Role                           | Read | Create | Edit | Delete |
| ------------------------------ | ---- | ------ | ---- | ------ |
| Public visitor (not logged in) | ✅   | ❌     | ❌   | ❌     |
| Admin (logged in via `/admin`) | ✅   | ✅     | ✅   | ✅     |

---

## Upgrading an Existing Database

If you set up the database manually before this script existed, just re-run `supabase/setup.sql`. It uses `ALTER TABLE … ADD COLUMN IF NOT EXISTS` throughout, so it will safely add any missing columns without touching your existing data.
