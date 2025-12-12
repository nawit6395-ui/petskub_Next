-- Add slug column to forum_posts table
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS slug text;

-- Create a unique index on the slug column
CREATE UNIQUE INDEX IF NOT EXISTS forum_posts_slug_idx ON forum_posts (slug);

-- Optional: Backfill existing posts with a slug based on title (or id if title is tricky in SQL)
-- For now, we leave existing valid, but new ones will have slug.
