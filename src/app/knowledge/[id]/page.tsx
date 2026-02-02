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

    const decodedId = decodeURIComponent(idOrSlug);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedId);
    let url = `${supabaseUrl}/rest/v1/knowledge_articles?select=*&published=eq.true`;

    if (isUUID) {
        url += `&id=eq.${decodedId}`;
    } else {
        url += `&slug=eq.${decodedId}`;
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

    const title = `${article.title} | บทความความรู้รับเลี้ยงสัตว์ | PetsKub`;
    const description = article.content
        ? article.content.substring(0, 150).replace(/\n/g, ' ').replace(/#/g, '') + '...'
        : "อ่านบทความความรู้เกี่ยวกับการรับเลี้ยงสุนัข รับเลี้ยงแมว และการดูแลสัตว์เลี้ยงจาก PetsKub";

    const images = article.image_url ? [article.image_url] : [];
    const canonicalUrl = `https://petskub.com/knowledge/${id}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            images,
            type: "article",
            url: canonicalUrl,
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
    const article = await getArticle(id);

    // JSON-LD Schema
    const jsonLd = article ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "image": article.image_url ? [article.image_url] : [],
        "datePublished": article.created_at,
        "dateModified": article.updated_at || article.created_at,
        "author": [{
            "@type": "Organization",
            "name": "PetsKub Community",
            "url": "https://petskub.com"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "PetsKub",
            "logo": {
                "@type": "ImageObject",
                "url": "https://petskub.com/Logo.png"
            }
        },
        "description": article.content ? article.content.substring(0, 150) : "บทความจาก PetsKub"
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <ArticleDetailClient id={id} />
        </>
    );
}
