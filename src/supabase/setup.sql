-- =============================================================================
-- Waver Portfolio — Supabase Database Setup Script
-- =============================================================================
-- Run this entire script in the Supabase SQL Editor (one paste, one run).
-- It is safe to re-run; all statements use IF NOT EXISTS / OR REPLACE guards.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------------

-- uuid_generate_v4() used for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ---------------------------------------------------------------------------
-- 2. TABLE
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS entries (
  -- Identity
  id                      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                    TEXT          UNIQUE NOT NULL,

  -- Display
  title                   TEXT          NOT NULL,
  description             TEXT,                           -- SEO / social cards

  -- Thumbnail (Cloudinary)
  thumbnail_id            TEXT          NOT NULL,         -- Cloudinary public_id
  thumbnail_resource_type TEXT          NOT NULL DEFAULT 'image'
                            CHECK (thumbnail_resource_type IN ('image', 'video')),
  thumbnail_format        TEXT,                           -- e.g. 'gif', 'mp4'
  width                   INTEGER       NOT NULL DEFAULT 16,
  height                  INTEGER       NOT NULL DEFAULT 9,

  -- Embedded video (YouTube / Vimeo / Google Drive share URL)
  video_url               TEXT,

  -- Category
  category                TEXT          NOT NULL DEFAULT 'other'
                            CHECK (category IN ('wave', 'game', 'music', 'other')),

  -- Manual display order (lower = shown first)
  sort_order              INTEGER       NOT NULL DEFAULT 0,

  -- Rich content (Novel / Tiptap JSON)
  content_json            JSONB         NOT NULL DEFAULT '{}',

  -- Bottom-of-page gallery (array of Cloudinary public_ids)
  gallery_ids             TEXT[]        NOT NULL DEFAULT '{}',

  -- Timestamps
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for the default sort used by getEntries()
CREATE INDEX IF NOT EXISTS entries_sort_order_idx
  ON entries (sort_order ASC, created_at DESC);


-- ---------------------------------------------------------------------------
-- 3. ROW-LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------------

-- Enable RLS on the table
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Public (anonymous) users can READ all entries — needed for the public site
DROP POLICY IF EXISTS "Public can read entries" ON entries;
CREATE POLICY "Public can read entries"
  ON entries
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users (admins) can INSERT
DROP POLICY IF EXISTS "Authenticated users can insert entries" ON entries;
CREATE POLICY "Authenticated users can insert entries"
  ON entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can UPDATE
DROP POLICY IF EXISTS "Authenticated users can update entries" ON entries;
CREATE POLICY "Authenticated users can update entries"
  ON entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users (admins) can DELETE
DROP POLICY IF EXISTS "Authenticated users can delete entries" ON entries;
CREATE POLICY "Authenticated users can delete entries"
  ON entries
  FOR DELETE
  TO authenticated
  USING (true);


-- ---------------------------------------------------------------------------
-- 4. MIGRATION HELPERS
-- ---------------------------------------------------------------------------
-- If you are upgrading an existing database that was set up without this
-- script, run the ALTER TABLE statements below to add any missing columns.
-- They are all safe to run on a fresh database too (IF NOT EXISTS guard).

ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS thumbnail_resource_type TEXT NOT NULL DEFAULT 'image'
    CHECK (thumbnail_resource_type IN ('image', 'video'));

ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS thumbnail_format TEXT;

ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('wave', 'game', 'music', 'other'));

ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Initialise sort_order for existing rows so they keep their original order
-- (no-op on a fresh database)
UPDATE entries
SET sort_order = sub.rn
FROM (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1) AS rn
  FROM entries
  WHERE sort_order = 0
) sub
WHERE entries.id = sub.id
  AND entries.sort_order = 0;


-- ---------------------------------------------------------------------------
-- 5. VERIFICATION
-- ---------------------------------------------------------------------------
-- After running the script, confirm everything looks correct:

SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'entries'
ORDER BY ordinal_position;
