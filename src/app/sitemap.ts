import { MetadataRoute } from "next";

const baseUrl = "https://petskub.com";

// Helper to fetch IDs/Slugs from Supabase
async function fetchSupabaseData(table: string, select = "id, slug") {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${select}&order=created_at.desc`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error(`Error fetching sitemap data for ${table}:`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/adopt`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/knowledge`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/forum`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/report`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reports/map`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. Dynamic Knowledge Articles
  const articles = await fetchSupabaseData("knowledge_articles", "id, slug");
  const articleRoutes: MetadataRoute.Sitemap = articles.map((item: any) => ({
    url: `${baseUrl}/knowledge/${item.slug || item.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 3. Dynamic Forum Posts
  const forums = await fetchSupabaseData("forum_posts", "id, slug");
  const forumRoutes: MetadataRoute.Sitemap = forums.map((item: any) => ({
    url: `${baseUrl}/forum/${item.slug || item.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  return [...routes, ...articleRoutes, ...forumRoutes];
}
