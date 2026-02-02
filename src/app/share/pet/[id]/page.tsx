import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import SharePetClient from "./SharePetClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getPet(id: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    try {
        const res = await fetch(
            `${supabaseUrl}/rest/v1/cats?id=eq.${id}&select=*`,
            {
                headers: {
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`,
                },
                next: { revalidate: 60 },
            }
        );

        if (!res.ok) return null;

        const data = await res.json();
        return data?.[0] || null;
    } catch (error) {
        console.error("Error fetching pet for share:", error);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const pet = await getPet(id);

    if (!pet) {
        return {
            title: "ไม่พบสัตว์เลี้ยง | PetsKub",
            description: "สัตว์เลี้ยงที่คุณค้นหาอาจถูกลบหรือไม่มีอยู่จริง",
        };
    }

    const title = `${pet.name} - ${pet.is_adopted ? 'ได้บ้านแล้ว' : 'กำลังหาบ้าน'} | PetsKub`;
    const description = `🐾 ${pet.name} • อายุ ${pet.age} • ${pet.province}${pet.district ? ` - ${pet.district}` : ''} • ${pet.health_status || 'สุขภาพดี'}${pet.story ? ` • ${pet.story.substring(0, 100)}...` : ''}`;
    
    // Use first image from array or placeholder
    const imageUrl = pet.image_url?.[0] || `https://petskub.com/api/og/pet?id=${id}`;
    const canonicalUrl = `https://petskub.com/share/pet/${id}`;

    return {
        title,
        description,
        keywords: [
            pet.name,
            "หมาหาบ้าน",
            "แมวหาบ้าน",
            "รับเลี้ยงสุนัข",
            "รับเลี้ยงแมว",
            pet.province,
            "Petskub",
        ],
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `🐾 ${pet.name} กำลังหาบ้านที่อบอุ่น`,
            description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${pet.name} - สัตว์เลี้ยงหาบ้าน ${pet.province} - Petskub`,
                },
            ],
            type: "article",
            url: canonicalUrl,
            siteName: "Petskub",
            locale: "th_TH",
        },
        twitter: {
            card: "summary_large_image",
            title: `🐾 ${pet.name} กำลังหาบ้านที่อบอุ่น`,
            description,
            images: [imageUrl],
            site: "@Petskub",
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function SharePetPage({ params }: PageProps) {
    const { id } = await params;
    const pet = await getPet(id);

    if (!pet) {
        notFound();
    }

    // JSON-LD Schema for Pet
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": pet.name,
        "description": pet.story || `${pet.name} กำลังหาบ้านที่อบอุ่น`,
        "image": pet.image_url?.[0] || "https://petskub.com/Logo.png",
        "brand": {
            "@type": "Organization",
            "name": "Petskub"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "THB",
            "availability": pet.is_adopted 
                ? "https://schema.org/SoldOut" 
                : "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "Petskub"
            }
        },
        "additionalProperty": [
            {
                "@type": "PropertyValue",
                "name": "age",
                "value": pet.age
            },
            {
                "@type": "PropertyValue",
                "name": "location",
                "value": `${pet.province}${pet.district ? `, ${pet.district}` : ''}`
            },
            {
                "@type": "PropertyValue",
                "name": "healthStatus",
                "value": pet.health_status || "สุขภาพดี"
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <SharePetClient pet={pet} />
        </>
    );
}
