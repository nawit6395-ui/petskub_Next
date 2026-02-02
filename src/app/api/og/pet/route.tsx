import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

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
            }
        );

        if (!res.ok) return null;
        const data = await res.json();
        return data?.[0] || null;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return new Response("Missing pet ID", { status: 400 });
    }

    const pet = await getPet(id);

    if (!pet) {
        return new Response("Pet not found", { status: 404 });
    }

    const petImage = pet.image_url?.[0];

    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                {/* Left Side - Pet Image */}
                <div
                    style={{
                        display: "flex",
                        width: "50%",
                        height: "100%",
                        padding: "40px",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {petImage ? (
                        <img
                            src={petImage}
                            alt={pet.name}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "32px",
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                width: "100%",
                                height: "100%",
                                background: "#FED7AA",
                                borderRadius: "32px",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "120px",
                            }}
                        >
                            🐾
                        </div>
                    )}

                    {/* Urgent Badge */}
                    {pet.is_urgent && !pet.is_adopted && (
                        <div
                            style={{
                                position: "absolute",
                                top: "60px",
                                left: "60px",
                                background: "#EF4444",
                                color: "white",
                                padding: "8px 24px",
                                borderRadius: "20px",
                                fontSize: "24px",
                                fontWeight: "bold",
                            }}
                        >
                            ⚠️ ด่วน
                        </div>
                    )}

                    {/* Adopted Overlay */}
                    {pet.is_adopted && (
                        <div
                            style={{
                                position: "absolute",
                                top: "40px",
                                left: "40px",
                                right: "50%",
                                bottom: "40px",
                                background: "rgba(16, 185, 129, 0.85)",
                                borderRadius: "32px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                            }}
                        >
                            <div style={{ fontSize: "64px", marginBottom: "16px" }}>✓</div>
                            <div style={{ fontSize: "36px", fontWeight: "bold" }}>ได้บ้านแล้ว!</div>
                        </div>
                    )}
                </div>

                {/* Right Side - Pet Info */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "50%",
                        height: "100%",
                        padding: "60px 60px 60px 20px",
                        justifyContent: "center",
                    }}
                >
                    {/* Badge */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "16px",
                        }}
                    >
                        <div
                            style={{
                                background: pet.is_adopted ? "#10B981" : "#F59E0B",
                                color: "white",
                                padding: "8px 20px",
                                borderRadius: "20px",
                                fontSize: "20px",
                                fontWeight: "600",
                            }}
                        >
                            {pet.is_adopted ? "🏡 ได้บ้านแล้ว" : "❤️ กำลังหาบ้าน"}
                        </div>
                        <div
                            style={{
                                background: "white",
                                padding: "8px 16px",
                                borderRadius: "20px",
                                fontSize: "18px",
                            }}
                        >
                            {pet.gender === "ชาย" ? "♂️ ผู้" : pet.gender === "หญิง" ? "♀️ เมีย" : ""}
                        </div>
                    </div>

                    {/* Name */}
                    <div
                        style={{
                            fontSize: "72px",
                            fontWeight: "bold",
                            color: "#78350F",
                            marginBottom: "24px",
                            lineHeight: 1.1,
                        }}
                    >
                        {pet.name}
                    </div>

                    {/* Info Grid */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            marginBottom: "32px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                                style={{
                                    background: "#FEF3C7",
                                    padding: "12px",
                                    borderRadius: "12px",
                                    fontSize: "28px",
                                }}
                            >
                                📅
                            </div>
                            <div style={{ fontSize: "28px", color: "#44403C" }}>
                                อายุ {pet.age}
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                                style={{
                                    background: "#FCE7F3",
                                    padding: "12px",
                                    borderRadius: "12px",
                                    fontSize: "28px",
                                }}
                            >
                                📍
                            </div>
                            <div style={{ fontSize: "28px", color: "#44403C" }}>
                                {pet.province}{pet.district ? ` - ${pet.district}` : ""}
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                                style={{
                                    background: "#D1FAE5",
                                    padding: "12px",
                                    borderRadius: "12px",
                                    fontSize: "28px",
                                }}
                            >
                                💚
                            </div>
                            <div style={{ fontSize: "28px", color: "#44403C" }}>
                                {pet.health_status || "สุขภาพดี"}
                            </div>
                        </div>
                    </div>

                    {/* Footer - Logo */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            marginTop: "auto",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "48px",
                            }}
                        >
                            🐾
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div
                                style={{
                                    fontSize: "36px",
                                    fontWeight: "bold",
                                    background: "linear-gradient(90deg, #F97316, #EA580C)",
                                    backgroundClip: "text",
                                    color: "transparent",
                                }}
                            >
                                Petskub
                            </div>
                            <div style={{ fontSize: "18px", color: "#78716C" }}>
                                หมาหาบ้าน แมวหาบ้าน รับเลี้ยงสุนัข รับเลี้ยงแมว
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
