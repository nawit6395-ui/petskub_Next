import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Heart, MessageCircle, Eye, Check, RotateCcw, ShieldCheck, Share2, Trash2, Play, Flame, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ImageGallery } from "@/components/ImageGallery";
import { useDeleteCat, useUpdateCat } from "@shared/hooks/useCats";
import { useIsAdmin } from "@/hooks/useUserRole";
import { alert } from "@/lib/alerts";
import { useCreateConversation } from "@/hooks/useConversations";
import { useRouter } from "next/navigation";
import { FaFacebookF, FaLine } from "react-icons/fa";
import Image from "next/image";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@shared/integrations/supabase/client";

interface CatCardProps {
  id?: string;
  name: string;
  age: string;
  province: string;
  district?: string | null;
  image?: string[] | null;
  images?: string[] | null;
  story?: string | null;
  gender: "ชาย" | "หญิง" | "ไม่ระบุ";
  isAdopted?: boolean;
  urgent?: boolean;
  contactName?: string;
  contactPhone?: string;
  contactLine?: string | null;
  userId?: string;
  healthStatus?: string | null;
  isSterilized?: boolean;
  createdAt?: string;
  views?: number; // New prop for views
  hasVideo?: boolean; // New prop for video
}

const CatCard = ({ id, name, age, province, district, image, images, story, gender, isAdopted, urgent, contactName, contactPhone, contactLine, userId, healthStatus, isSterilized, createdAt, views, hasVideo }: CatCardProps) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = id ? isFavorite(id) : false;
  const router = useRouter();

  // Real views from props or incremented locally? 
  // We use prop 'views' if available. If not, fallback to 0. 
  const [displayViews, setDisplayViews] = useState(views || 0);

  useEffect(() => {
    // Increment view count on mount
    const incrementView = async () => {
      if (!id) return;
      try {
        await supabase.rpc('increment_cat_views' as any, { cat_id: id });
      } catch (error) {
        console.error("Error incrementing view:", error);
      }
    };

    incrementView();
  }, [id]);

  useEffect(() => {
    if (views !== undefined) {
      setDisplayViews(views);
    }
  }, [views]);


  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'วันนี้';
    if (diffInDays === 1) return 'เมื่อวาน';
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} สัปดาห์ที่แล้ว`;
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const isNew = createdAt ? (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24) < 2 : false;

  const [showContact, setShowContact] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const updateCat = useUpdateCat();
  const deleteCat = useDeleteCat();
  const isAdmin = useIsAdmin();
  const createConversation = useCreateConversation();

  const isOwner = user?.id === userId;
  const canManageStatus = isOwner || isAdmin;
  const canStartChat = Boolean(id && userId && !isOwner && !isAdopted);

  // SEO Schema Markup
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product", // Applied Product schema for rich snippets
    "name": `${name} - ${gender} ${age} หาบ้าน`,
    "image": images && images.length > 0 ? images : image,
    "description": story || `น้องแมว ${name} กำลังหาบ้าน อายุ ${age} เพศ${gender} พิกัด ${province}`,
    "brand": {
      "@type": "Brand",
      "name": "Petskub"
    },
    "mask": {
      "@type": "Product",
      "name": "Cat"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "THB",
      "price": "0",
      "availability": isAdopted ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      "url": typeof window !== "undefined" ? `${window.location.origin}/adopt` : ""
    }
  };

  const handleMarkAsAdopted = async () => {
    if (!id || !canManageStatus) return;
    try {
      await updateCat.mutateAsync({ id, is_adopted: true });
      alert.success('🎉 ยินดีด้วย!', {
        description: `${name} ได้บ้านใหม่แล้ว ขอบคุณที่ให้ความรักกับน้อง ๆ`
      });
    } catch (error) {
      alert.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถอัพเดทสถานะได้'
      });
    }
  };

  const handleMarkAsAvailable = async () => {
    if (!id || !canManageStatus) return;
    try {
      await updateCat.mutateAsync({ id, is_adopted: false });
      alert.success('อัพเดทสถานะสำเร็จ', {
        description: `${name} พร้อมรับเลี้ยงอีกครั้ง`
      });
    } catch (error) {
      alert.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถอัพเดทสถานะได้'
      });
    }
  };

  const handleDeleteCat = async () => {
    if (!id || deleteCat.isPending) return;
    const result = await alert.confirm("ต้องการลบประกาศนี้หรือไม่?", {
      description: "เมื่อลบแล้วจะไม่สามารถกู้คืนได้",
      confirmText: "ลบประกาศ",
    });
    if (result.isConfirmed) {
      deleteCat.mutate(id, {
        onSuccess: () => {
          alert.success("ลบประกาศแล้ว");
        },
        onError: (error) => {
          alert.error("ลบไม่สำเร็จ", {
            description: error.message,
          });
        },
      });
    }
  };

  const buildShareUrl = () => {
    if (typeof window === "undefined") return "";
    return id ? `${window.location.origin}/share/pet/${id}` : `${window.location.origin}/adopt`;
  };

  const buildShareText = () =>
    `🐾 ช่วยแชร์ให้น้อง${name}ได้บ้านใหม่ด้วยนะคะ/ครับ!\n\n• อายุ: ${age}\n• พื้นที่: ${province}${district ? ` - ${district}` : ""}\n• สุขภาพ: ${healthStatus || "แข็งแรง"}\n\n👇 ดูรายละเอียดเพิ่มเติมได้ที่`.trim();

  const shareOnFacebook = () => {
    if (typeof window === "undefined") return;
    const url = buildShareUrl();
    if (!url) return;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const shareOnLine = () => {
    if (typeof window === "undefined") return;
    const url = buildShareUrl();
    if (!url) return;
    const text = buildShareText();
    const shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const copyShareLink = async () => {
    if (typeof navigator === "undefined") return;
    const url = buildShareUrl();
    const text = `${buildShareText()}\n${url}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert.success("คัดลอกลิงก์แล้ว!", {
          description: "พร้อมแชร์ให้เพื่อนๆ ช่วยหาบ้านให้น้อง"
        });
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (error) {
      alert.error("คัดลอกไม่สำเร็จ", {
        description: (error as Error)?.message || "พยายามอีกครั้ง",
      });
    }
  };

  const copyUrlOnly = async () => {
    if (typeof navigator === "undefined") return;
    const url = buildShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        alert.success("คัดลอก URL แล้ว!");
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (error) {
      alert.error("คัดลอกไม่สำเร็จ");
    }
  };

  // Use new images array if available, fallback to old image prop
  const displayImages = images && images.length > 0
    ? images
    : (image && Array.isArray(image)
      ? image
      : (typeof image === 'string' ? [image] : []));
  const firstImage = displayImages[0] || '/placeholder.svg';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Card className={`group overflow-hidden border-0 rounded-2xl sm:rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] sm:hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 sm:duration-500 ease-out ${isAdopted ? 'ring-2 ring-emerald-200' : 'hover:-translate-y-0.5 sm:hover:-translate-y-1'}`}>
        <div className={`relative w-full aspect-[3/2] sm:aspect-[4/3] overflow-hidden ${isAdopted ? '' : 'group-hover:brightness-105'}`}>
          <Image
            src={firstImage}
            alt={`${name} แมวหาบ้าน ${province} ${district ? district : ''} ${gender} ${age} - Petskub`}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-300 sm:duration-500 ${displayImages.length > 1 ? 'cursor-pointer' : ''} ${isAdopted ? 'brightness-[0.85] saturate-75' : 'group-hover:scale-[1.03] sm:group-hover:scale-105'}`}
            onClick={() => displayImages.length > 1 && setGalleryOpen(true)}
            priority={false}
          />

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

          {/* Video Indicator */}
          {hasVideo && !isAdopted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Favorite Button */}
          {!isOwner && !isAdopted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  alert.error('กรุณาเข้าสู่ระบบ', {
                    description: 'คุณต้องเข้าสู่ระบบเพื่อบันทึกรายการโปรด'
                  });
                  return;
                }
                if (id) toggleFavorite(id, name);
              }}
              className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm transition-all active:scale-95 group/fav"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover/fav:text-rose-500"}`}
              />
            </button>
          )}

          {/* Adopted Overlay */}
          {isAdopted && (
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/95 via-emerald-500/60 to-emerald-400/30 flex items-center justify-center backdrop-blur-[2px]">
              <div className="text-center text-white drop-shadow-lg px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Check className="w-6 h-6 sm:w-9 sm:h-9" strokeWidth={3} />
                </div>
                <p className="text-lg sm:text-2xl font-bold font-prompt tracking-wide">รับเลี้ยงแล้ว</p>
                <p className="text-xs sm:text-sm font-prompt mt-0.5 sm:mt-1 opacity-90">Happy Ending 🎉</p>
              </div>
            </div>
          )}

          {/* Photo count badge */}
          {displayImages.length > 1 && (
            <button
              type="button"
              className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-black/60 backdrop-blur-md text-white border border-white/20 font-prompt cursor-pointer z-10 text-[8px] px-1 py-px rounded-full hover:bg-black/75 transition-colors active:scale-95 shadow-sm"
              onClick={() => setGalleryOpen(true)}
            >
              <span className="text-[8px]">📷</span>
              <span className="font-medium">{displayImages.length}</span>
            </button>
          )}

          {/* Admin delete button - Discreet Top Left */}
          {isAdmin && id && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute top-1.5 left-1.5 h-5 w-5 rounded-full bg-black/20 text-white/90 hover:bg-rose-500 hover:text-white backdrop-blur-sm transition-all active:scale-95 z-20"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteCat();
              }}
              disabled={deleteCat.isPending}
            >
              <Trash2 className="h-2.5 w-2.5" />
              <span className="sr-only">ลบประกาศ</span>
            </Button>
          )}

          {/* Urgent & New Badges - Overlay on Image (Clear of Delete Button) */}
          <div className={`absolute top-1.5 ${isAdmin ? 'left-7' : 'left-1.5'} flex flex-col gap-1 items-start z-10`}>
            {urgent && !isAdopted && (
              <div className="flex items-center gap-0.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-prompt text-[8px] font-bold px-1 py-px rounded shadow-sm animate-pulse border border-white/20">
                <span>🔥 ด่วน</span>
              </div>
            )}
            {isNew && !isAdopted && !urgent && (
              <div className="flex items-center gap-0.5 bg-blue-500/90 backdrop-blur-sm text-white font-prompt text-[8px] font-bold px-1 py-px rounded shadow-sm border border-white/20">
                <span>🆕 มาใหม่</span>
              </div>
            )}
          </div>

          {/* Gender Badge - Back on Image (Bottom Right) */}
          <div className={`absolute bottom-1.5 right-1.5 flex items-center gap-0.5 backdrop-blur-md font-prompt text-[7px] font-bold px-1 py-px rounded-full shadow-sm border border-white/20 ${gender === 'ชาย' ? 'bg-blue-500/80 text-white' : gender === 'หญิง' ? 'bg-pink-500/80 text-white' : 'bg-slate-500/80 text-white'}`}>
            <span>{gender === 'ชาย' ? '♂' : gender === 'หญิง' ? '♀' : '⚪'} {gender}</span>
          </div>
        </div>

        <div className="px-3 pt-2 pb-2.5 space-y-1.5">
          {/* Row 1: Name + Heart + "หาบ้าน" */}
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-[13px] font-prompt text-slate-800 truncate leading-snug">{name}</h3>
            {!isAdopted && (
              <div className="flex items-center gap-1 shrink-0">
                <Heart className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span className="text-[10px] font-prompt text-orange-500 font-semibold">หาบ้าน</span>
              </div>
            )}
          </div>

          {/* Location Row */}
          <div className="flex items-center gap-1 text-[11px] font-prompt text-slate-600">
            <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
            <span className="truncate">{province}</span>
          </div>

          {/* Detail Bullets */}
          <div className="text-[11px] font-prompt text-slate-500 space-y-0.5 pl-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300">·</span>
              <span>{age}</span>
              {isSterilized && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-600">ö</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300">·</span>
              <span className="truncate">{healthStatus || 'แข็งแรง'}</span>
              {isSterilized && (
                <span className="inline-flex items-center gap-0.5 text-emerald-600">
                  <Check className="w-2.5 h-2.5" /> ทำหมัน
                </span>
              )}
            </div>
          </div>

          {/* Story */}
          {story && (
            <p className="text-[10px] text-slate-400 font-prompt line-clamp-2 leading-relaxed">
              &quot;{story}&quot;
            </p>
          )}

          {/* Contact Info Expanded */}
          {user && showContact && contactPhone && (
            <div className="bg-emerald-50/80 rounded-md p-2 text-[10px] text-emerald-700 font-prompt space-y-0.5 border border-emerald-100">
              {contactName && <p className="truncate font-medium">👤 {contactName}</p>}
              <p>📱 {contactPhone}</p>
              {contactLine && <p className="truncate">💬 {contactLine}</p>}
            </div>
          )}

          {/* Status Management for Owner/Admin */}
          {canManageStatus && (
            <div className="flex items-center gap-1.5">
              {!isAdopted ? (
                <Button
                  size="sm"
                  onClick={handleMarkAsAdopted}
                  disabled={updateCat.isPending}
                  className="flex-1 font-prompt h-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-[10px] shadow-sm"
                >
                  <Check className="w-3 h-3 mr-1" />
                  ได้บ้านแล้ว
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAsAvailable}
                  disabled={updateCat.isPending}
                  className="flex-1 font-prompt h-7 border-slate-200 hover:bg-slate-50 rounded-full text-[10px] shadow-sm"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  เปิดรับเลี้ยงคืน
                </Button>
              )}
              {isAdmin && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-rose-400 hover:bg-rose-50 rounded-full"
                  onClick={handleDeleteCat}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}

          {/* Action Buttons - Matching Reference */}
          {!isAdopted && (
            <div className="space-y-1.5 pt-0.5">
              {/* Row 1: Contact + Chat (orange pills) */}
              <div className="flex items-center gap-1">
                {/* Contact */}
                {!showContact ? (
                  <Button
                    size="xs"
                    className="flex-1 font-prompt rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[7px] font-medium shadow-sm"
                    onClick={() => {
                      if (!user) {
                        alert.error('กรุณาเข้าสู่ระบบ');
                        return;
                      }
                      setShowContact(true);
                    }}
                  >
                    <Phone className="w-2.5 h-2.5" />
                    <span>ติดต่อ</span>
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    className="flex-1 font-prompt rounded-full bg-emerald-500 text-white hover:bg-emerald-600 text-[7px] font-medium shadow-sm"
                    asChild
                  >
                    <a href={`tel:${contactPhone}`}>
                      <Phone className="w-2.5 h-2.5" />
                      <span>โทร</span>
                    </a>
                  </Button>
                )}

                {/* Chat */}
                <Button
                  size="xs"
                  className="flex-1 font-prompt rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[7px] font-medium shadow-sm"
                  disabled={!canStartChat || createConversation.isPending}
                  onClick={() => {
                    if (!user) {
                      alert.error('กรุณาเข้าสู่ระบบ');
                      router.push('/login');
                      return;
                    }
                    if (!id || !userId) {
                      alert.error('ไม่พบข้อมูล');
                      return;
                    }
                    createConversation.mutate(
                      { catId: id, ownerId: userId, adopterId: user.id },
                      {
                        onSuccess: (conversation) => {
                          router.push(`/chat?conversationId=${conversation.id}`);
                        },
                      }
                    );
                  }}
                >
                  <MessageCircle className="w-2.5 h-2.5" />
                  <span>แชท</span>
                </Button>
              </div>

              {/* Row 2: Share (outline, separate row) */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center justify-center gap-1 w-full text-[10px] font-prompt text-slate-400 hover:text-slate-600 transition-colors py-0.5"
                    type="button"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>แชร์</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-44 p-1.5">
                  <div className="grid gap-0.5">
                    <button className="flex items-center gap-2 w-full px-2 py-1.5 text-[11px] font-prompt text-slate-600 hover:bg-slate-50 rounded-md transition-colors" onClick={shareOnFacebook}>
                      <FaFacebookF className="text-blue-600 w-3 h-3" /> Facebook
                    </button>
                    <button className="flex items-center gap-2 w-full px-2 py-1.5 text-[11px] font-prompt text-slate-600 hover:bg-slate-50 rounded-md transition-colors" onClick={shareOnLine}>
                      <FaLine className="text-green-500 w-3 h-3" /> LINE
                    </button>
                    <button className="flex items-center gap-2 w-full px-2 py-1.5 text-[11px] font-prompt text-slate-600 hover:bg-slate-50 rounded-md transition-colors" onClick={copyShareLink}>
                      <MessageCircle className="w-3 h-3 text-slate-400" /> คัดลอกลิงก์
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Adopted Status */}
          {isAdopted && !canManageStatus && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
              <p className="text-[11px] font-semibold text-emerald-700 font-prompt">
                ✨ น้อง{name}ได้บ้านใหม่แล้ว
              </p>
            </div>
          )}
        </div>
      </Card>

      {displayImages.length > 0 && (
        <ImageGallery
          images={displayImages}
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
        />
      )}
    </>
  );
};

export default CatCard;
