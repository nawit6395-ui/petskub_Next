-- Create a function to safely increment article views
create or replace function increment_article_views(article_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update knowledge_articles
  set views = views + 1
  where id = article_id;
end;
$$;
