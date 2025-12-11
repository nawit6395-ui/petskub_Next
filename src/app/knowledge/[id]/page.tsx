import { Metadata } from "next";
import ArticleDetailClient from "./ArticleDetailClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getArticle(idOrSlug: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    let url = `${supabaseUrl}/rest/v1/knowledge_articles?select=*&published=eq.true`;

    if (isUUID) {
        url += `&id=eq.${idOrSlug}`;
    } else {
        url += `&slug=eq.${idOrSlug}`;
    }

    // Use &limit=1 and header Prefer: return=representation to get single object like .single()
    // But standard REST returns array. We'll stick to array and take first.

    try {
        const res = await fetch(url, {
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
            },
            next: { revalidate: 60 }, // Revalidate every 60 seconds
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data?.[0] || null;
    } catch (error) {
        console.error("Error fetching article for metadata:", error);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const article = await getArticle(id);

    if (!article) {
        return {
            title: "ไม่พบบทความ | PetsKub",
            description: "บทความที่คุณค้นหาอาจถูกลบหรือไม่มีอยู่จริง",
        };
    }

    const title = `${article.title} | PetsKub`;
    const description = article.content
        ? article.content.substring(0, 150).replace(/\n/g, ' ') + '...'
        : "อ่านบทความน่ารู้เกี่ยวกับสัตว์เลี้ยงที่ PetsKub";

    const images = article.image_url ? [article.image_url] : [];

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images,
        },
    };
}

export default async function ArticlePage({ params }: PageProps) {
    const { id } = await params;
    return <ArticleDetailClient id={id} />;
}
