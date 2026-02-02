-- Update forum_post_stats view to include slug column
-- This fixes the error: column forum_post_stats.slug does not exist

-- First, drop the existing view
DROP VIEW IF EXISTS forum_post_stats;

-- Recreate the view with slug column included
CREATE OR REPLACE VIEW forum_post_stats AS
SELECT 
    fp.id,
    fp.title,
    fp.content,
    fp.category,
    fp.user_id,
    fp.created_at,
    fp.updated_at,
    fp.views,
    fp.is_pinned,
    fp.image_urls,
    fp.slug,
    COALESCE(likes.like_count, 0) AS like_count,
    COALESCE(comments.comment_count, 0) AS comment_count,
    -- Calculate trend score: likes * 2 + comments + views * 0.2
    (COALESCE(likes.like_count, 0) * 2 + COALESCE(comments.comment_count, 0) + COALESCE(fp.views, 0) * 0.2) AS trend_score
FROM forum_posts fp
LEFT JOIN (
    SELECT post_id, COUNT(*) AS like_count
    FROM forum_post_reactions
    GROUP BY post_id
) likes ON fp.id = likes.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) AS comment_count
    FROM forum_comments
    GROUP BY post_id
) comments ON fp.id = comments.post_id;

-- Grant permissions for the view
GRANT SELECT ON forum_post_stats TO authenticated;
GRANT SELECT ON forum_post_stats TO anon;
