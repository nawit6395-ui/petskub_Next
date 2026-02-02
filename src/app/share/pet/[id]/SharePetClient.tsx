"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Heart, 
    MapPin, 
    Calendar, 
    Stethoscope, 
    Phone, 
    MessageCircle,
    Share2,
    Home,
    Check,
    ArrowLeft
} from "lucide-react";
import { FaFacebookF, FaLine } from "react-icons/fa";
import { alert } from "@/lib/alerts";

interface Pet {
    id: string;
    name: string;
    age: string;
    gender: "ชาย" | "หญิง" | "ไม่ระบุ";
    province: string;
    district?: string;
    image_url?: string[];
    story?: string;
    health_status?: string;
    is_sterilized?: boolean;
    is_adopted?: boolean;
    is_urgent?: boolean;
    contact_name?: string;
    contact_phone?: string;
    contact_line?: string;
}

interface SharePetClientProps {
    pet: Pet;
}

export default function SharePetClient({ pet }: SharePetClientProps) {
    const router = useRouter();
    
    const shareUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/share/pet/${pet.id}` 
        : `https://petskub.com/share/pet/${pet.id}`;

    const shareText = `🐾 ช่วยแชร์ให้น้อง${pet.name}ได้บ้านใหม่ด้วยนะคะ/ครับ!\n\n• อายุ: ${pet.age}\n• พื้นที่: ${pet.province}${pet.district ? ` - ${pet.district}` : ""}\n• สุขภาพ: ${pet.health_status || "แข็งแรง"}\n\n👇 ดูรายละเอียดเพิ่มเติมได้ที่`;

    const shareOnFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
            "_blank",
            "noopener,noreferrer,width=600,height=400"
        );
    };

    const shareOnLine = () => {
        window.open(
            `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    const copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            alert.success("คัดลอกลิงก์แล้ว!", {
                description: "พร้อมแชร์ให้เพื่อนๆ ช่วยหาบ้านให้น้อง"
            });
        } catch {
            alert.error("คัดลอกไม่สำเร็จ");
        }
    };

    const displayImages = pet.image_url || [];
    const firstImage = displayImages[0] || "/placeholder.svg";

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/adopt")}
                    className="mb-6 font-prompt gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    กลับไปหน้าหาบ้าน
                </Button>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src={firstImage}
                                alt={`${pet.name}-สัตว์เลี้ยงหาบ้าน-${pet.province}-Petskub`}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            {pet.is_adopted && (
                                <div className="absolute inset-0 bg-emerald-600/80 flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <Check className="w-16 h-16 mx-auto mb-2" />
                                        <p className="text-2xl font-bold font-prompt">ได้บ้านแล้ว! 🎉</p>
                                    </div>
                                </div>
                            )}
                            {pet.is_urgent && !pet.is_adopted && (
                                <Badge className="absolute top-4 right-4 bg-red-500 text-white font-prompt">
                                    ⚠️ ด่วน
                                </Badge>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {displayImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {displayImages.map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-md"
                                    >
                                        <Image
                                            src={img}
                                            alt={`${pet.name} รูปที่ ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pet Info */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-prompt">
                                    {pet.gender === "ชาย" ? "♂️ ผู้" : pet.gender === "หญิง" ? "♀️ เมีย" : "ไม่ระบุเพศ"}
                                </Badge>
                                {pet.is_sterilized && (
                                    <Badge variant="secondary" className="font-prompt bg-emerald-100 text-emerald-700">
                                        ✂️ ทำหมันแล้ว
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-4xl font-bold font-prompt text-amber-900">
                                {pet.name}
                            </h1>
                            <p className="text-lg text-muted-foreground font-prompt mt-2">
                                {pet.is_adopted ? "ได้บ้านใหม่แล้ว 🏡" : "กำลังหาบ้านที่อบอุ่น 💕"}
                            </p>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 bg-white/80">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-amber-100">
                                        <Calendar className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-prompt">อายุ</p>
                                        <p className="font-semibold font-prompt">{pet.age}</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-4 bg-white/80">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-rose-100">
                                        <MapPin className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-prompt">พื้นที่</p>
                                        <p className="font-semibold font-prompt text-sm">
                                            {pet.province}{pet.district ? ` - ${pet.district}` : ""}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-4 bg-white/80 col-span-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-emerald-100">
                                        <Stethoscope className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-prompt">สุขภาพ</p>
                                        <p className="font-semibold font-prompt">{pet.health_status || "สุขภาพดี"}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Story */}
                        {pet.story && (
                            <Card className="p-4 bg-white/80">
                                <h3 className="font-semibold font-prompt mb-2">📖 เรื่องราวของน้อง</h3>
                                <p className="text-muted-foreground font-prompt text-sm leading-relaxed">
                                    {pet.story}
                                </p>
                            </Card>
                        )}

                        {/* Share Section */}
                        <Card className="p-6 bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200">
                            <h3 className="font-bold font-prompt text-amber-900 mb-4 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                                ช่วยแชร์ให้น้อง{pet.name}หาบ้านได้เร็วขึ้น
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <Button
                                    onClick={shareOnFacebook}
                                    className="font-prompt gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <FaFacebookF className="w-4 h-4" />
                                    Facebook
                                </Button>
                                <Button
                                    onClick={shareOnLine}
                                    className="font-prompt gap-2 bg-green-500 hover:bg-green-600"
                                >
                                    <FaLine className="w-5 h-5" />
                                    LINE
                                </Button>
                                <Button
                                    onClick={copyShareLink}
                                    variant="outline"
                                    className="font-prompt gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                                >
                                    <Share2 className="w-4 h-4" />
                                    คัดลอก
                                </Button>
                            </div>
                        </Card>

                        {/* Contact Section */}
                        {!pet.is_adopted && pet.contact_phone && (
                            <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                                <h3 className="font-bold font-prompt text-emerald-900 mb-4 flex items-center gap-2">
                                    <Phone className="w-5 h-5" />
                                    ติดต่อรับเลี้ยง
                                </h3>
                                <div className="space-y-2 mb-4">
                                    {pet.contact_name && (
                                        <p className="font-prompt text-sm">👤 {pet.contact_name}</p>
                                    )}
                                    <p className="font-prompt text-sm">📱 {pet.contact_phone}</p>
                                    {pet.contact_line && (
                                        <p className="font-prompt text-sm">💬 LINE: {pet.contact_line}</p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        asChild
                                        className="flex-1 font-prompt bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <a href={`tel:${pet.contact_phone}`}>
                                            <Phone className="w-4 h-4 mr-2" />
                                            โทรหาเจ้าของ
                                        </a>
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* CTA */}
                        <div className="flex gap-4">
                            <Button
                                asChild
                                variant="outline"
                                className="flex-1 font-prompt"
                            >
                                <Link href="/adopt">
                                    <Home className="w-4 h-4 mr-2" />
                                    ดูสัตว์เลี้ยงอื่นๆ
                                </Link>
                            </Button>
                            <Button
                                asChild
                                className="flex-1 font-prompt bg-amber-500 hover:bg-amber-600"
                            >
                                <Link href="/add-cat">
                                    <Heart className="w-4 h-4 mr-2" />
                                    ลงประกาศหาบ้าน
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
