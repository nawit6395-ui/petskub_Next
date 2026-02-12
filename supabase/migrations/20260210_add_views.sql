-- Add views column to cats table
ALTER TABLE cats ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Add views column to urgent_cases table
ALTER TABLE urgent_cases ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create function to increment cat views
CREATE OR REPLACE FUNCTION increment_cat_views(cat_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE cats
  SET views = views + 1
  WHERE id = cat_id;
END;
$$;

-- Create function to increment urgent case views
CREATE OR REPLACE FUNCTION increment_urgent_case_views(case_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE urgent_cases
  SET views = views + 1
  WHERE id = case_id;
END;
$$;
