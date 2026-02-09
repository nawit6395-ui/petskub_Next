"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Heart, MessageCircle, Eye, Check, RotateCcw, ShieldCheck, Share2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { ImageGallery } from "@/components/ImageGallery";
import { useDeleteCat, useUpdateCat } from "@shared/hooks/useCats";
import { useIsAdmin } from "@/hooks/useUserRole";
import { alert } from "@/lib/alerts";
import { useCreateConversation } from "@/hooks/useConversations";
import { useRouter } from "next/navigation";
import { FaFacebookF, FaLine } from "react-icons/fa";
import Image from "next/image";

interface CatCardProps {
  id?: string;
  name: string;
  age: string;
  province: string;
  district?: string;
  image?: string[];
  images?: string[];
  story?: string;
  gender: "ชาย" | "หญิง" | "ไม่ระบุ";
  isAdopted?: boolean;
  urgent?: boolean;
  contactName?: string;
  contactPhone?: string;
  contactLine?: string;
  userId?: string;
  healthStatus?: string;
  isSterilized?: boolean;
  createdAt?: string;
}

const CatCard = ({ id, name, age, province, district, image, images, story, gender, isAdopted, urgent, contactName, contactPhone, contactLine, userId, healthStatus, isSterilized, createdAt }: CatCardProps) => {
  const { user } = useAuth();

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
  const [showContact, setShowContact] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const updateCat = useUpdateCat();
  const deleteCat = useDeleteCat();
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const createConversation = useCreateConversation();

  const isOwner = user?.id === userId;
  const canManageStatus = isOwner || isAdmin;
  const canStartChat = Boolean(id && userId && !isOwner && !isAdopted);

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
      <Card className={`group overflow-hidden border-0 rounded-2xl sm:rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] sm:hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 sm:duration-500 ease-out ${isAdopted ? 'ring-2 ring-emerald-200' : 'hover:-translate-y-0.5 sm:hover:-translate-y-1'}`}>
        <div className={`relative w-full aspect-[16/9] sm:aspect-[4/3] overflow-hidden ${isAdopted ? '' : 'group-hover:brightness-105'}`}>
          <Image
            src={firstImage}
            alt={`${name}-สัตว์เลี้ยงหาบ้าน-${province}${district ? `-${district}` : ''}-Petskub`}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-300 sm:duration-500 ${displayImages.length > 1 ? 'cursor-pointer' : ''} ${isAdopted ? 'brightness-[0.85] saturate-75' : 'group-hover:scale-[1.03] sm:group-hover:scale-105'}`}
            onClick={() => displayImages.length > 1 && setGalleryOpen(true)}
            priority={false}
          />

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

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
              className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-1 sm:gap-1.5 bg-black/60 backdrop-blur-md text-white border-0 font-prompt cursor-pointer z-10 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg hover:bg-black/75 transition-colors active:scale-95"
              onClick={() => setGalleryOpen(true)}
            >
              <span className="text-xs sm:text-sm">📷</span>
              <span className="font-medium">{displayImages.length}</span>
            </button>
          )}

          {/* Admin delete button */}
          {isAdmin && id && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/95 text-rose-500 hover:bg-rose-50 hover:text-rose-600 shadow-lg backdrop-blur-sm transition-all active:scale-95"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteCat();
              }}
              disabled={deleteCat.isPending}
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sr-only">ลบประกาศ</span>
            </Button>
          )}

          {/* Urgent badge */}
          {urgent && !isAdopted && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-prompt text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping" />
              <span>ด่วน</span>
            </div>
          )}

          {/* Gender badge on image */}
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-sm text-slate-700 font-prompt text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg">
            <span>{gender === 'ชาย' ? '♂️' : gender === 'หญิง' ? '♀️' : '⚪'}</span>
            <span className="hidden xs:inline">{gender}</span>
          </div>
        </div>

        <div className="p-2 sm:p-4 md:p-5 space-y-1 sm:space-y-3 md:space-y-4">
          {/* Header: Name and status */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-start sm:items-center justify-between gap-2">
              <h3 className="font-bold text-xs sm:text-lg md:text-xl font-prompt text-slate-800 truncate leading-tight">{name}</h3>
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {isSterilized && (
                  <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 text-emerald-600" title="ทำหมันแล้ว">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={3} />
                  </span>
                )}
                <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium font-prompt ${isAdopted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill={isAdopted ? 'currentColor' : 'none'} />
                  <span className="hidden xs:inline">{isAdopted ? 'มีบ้านแล้ว' : 'หาบ้าน'}</span>
                </span>
              </div>
            </div>

            {/* Location + Info inline */}
            <div className="flex items-center gap-1.5 text-[9px] sm:text-sm text-slate-500 font-prompt">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
              <span className="truncate">{province}</span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="hidden sm:inline truncate">{district}</span>
            </div>
          </div>

          {/* Compact info row */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[9px] sm:text-xs text-slate-500 font-prompt">
            <span>🎂 {age}</span>
            <span className="text-slate-300">•</span>
            <span className="truncate">💊 {healthStatus || 'ดี'}</span>
            {createdAt && (
              <>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="hidden sm:inline">🕐 {formatDate(createdAt)}</span>
              </>
            )}
          </div>

          {story && (
            <p className={`text-[9px] sm:text-sm text-slate-500 font-prompt leading-relaxed ${!storyExpanded && story.length > 60 ? 'line-clamp-1 sm:line-clamp-2' : ''}`}>
              "{story.length > 40 && !storyExpanded ? story.substring(0, 40) + '...' : story}"
              {story.length > 40 && (
                <button
                  type="button"
                  onClick={() => setStoryExpanded(!storyExpanded)}
                  className="ml-1 text-orange-500 hover:text-orange-600 font-medium"
                >
                  {storyExpanded ? 'ย่อ' : 'เพิ่มเติม'}
                </button>
              )}
            </p>
          )}

          {user && showContact && contactPhone && (
            <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-[9px] sm:text-xs text-emerald-700 font-prompt space-y-0.5 sm:space-y-1">
              {contactName && <p className="truncate">👤 {contactName}</p>}
              <p>📱 {contactPhone}</p>
              {contactLine && <p className="truncate">💬 {contactLine}</p>}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-1 sm:space-y-2 pt-1.5 sm:pt-3 border-t border-slate-100">
            {/* Status Management for Owner and Admin */}
            {canManageStatus && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {!isAdopted ? (
                  <Button
                    size="sm"
                    onClick={handleMarkAsAdopted}
                    disabled={updateCat.isPending}
                    className="flex-1 font-prompt gap-1 sm:gap-1.5 text-[10px] sm:text-xs h-8 sm:h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl shadow-sm active:scale-[0.98]"
                  >
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="truncate">{updateCat.isPending ? 'บันทึก...' : 'ได้บ้านแล้ว'}</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMarkAsAvailable}
                    disabled={updateCat.isPending}
                    className="flex-1 font-prompt gap-1 sm:gap-1.5 text-[10px] sm:text-xs h-8 sm:h-9 border-slate-200 hover:bg-slate-50 rounded-lg sm:rounded-xl active:scale-[0.98]"
                  >
                    <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="truncate">{updateCat.isPending ? 'บันทึก...' : 'เปิดรับเลี้ยงอีกครั้ง'}</span>
                  </Button>
                )}
                {isAdmin && (
                  <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-100 text-violet-700 text-[10px] font-medium font-prompt shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
            )}

            {!isAdopted && (
              <div className="flex gap-1 sm:gap-2">
                {!showContact ? (
                  <Button
                    size="sm"
                    className="flex-1 font-prompt gap-1 text-[9px] sm:text-xs h-7 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-400 to-amber-400 text-white font-medium shadow-sm active:scale-[0.98]"
                    onClick={() => {
                      if (!user) {
                        alert.error('กรุณาเข้าสู่ระบบ');
                        return;
                      }
                      setShowContact(true);
                    }}
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">ดูติดต่อ</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 font-prompt gap-1 text-[9px] sm:text-xs h-7 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500 text-white font-medium shadow-sm active:scale-[0.98]"
                    asChild
                  >
                    <a href={`tel:${contactPhone}`}>
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">โทร</span>
                    </a>
                  </Button>
                )}
                {canStartChat && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-prompt gap-1 text-[9px] sm:text-xs h-7 sm:h-10 rounded-lg sm:rounded-xl border border-orange-200 text-orange-500 bg-orange-50/50 active:scale-[0.98]"
                    disabled={createConversation.isPending}
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
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">แชท</span>
                  </Button>
                )}
              </div>
            )}

            {/* Share Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full font-prompt gap-1 text-[9px] sm:text-xs h-6 sm:h-9 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 active:scale-[0.98]"
                  aria-label="แชร์"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sm:inline">แชร์</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="center" sideOffset={8} className="w-[calc(100vw-2rem)] max-w-64 rounded-xl sm:rounded-2xl border-0 bg-white shadow-2xl p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-400 to-amber-400 px-3 sm:px-4 py-2.5 sm:py-3">
                  <p className="text-xs sm:text-sm font-medium text-white font-prompt flex items-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg">🐾</span>
                    <span className="truncate">ช่วยแชร์ให้น้อง{name}</span>
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 space-y-0.5 sm:space-y-1">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 sm:gap-3 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-prompt text-slate-700 hover:bg-blue-50 active:bg-blue-100 transition-all"
                    onClick={shareOnFacebook}
                  >
                    <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-blue-600 text-white shadow-md shrink-0">
                      <FaFacebookF className="text-sm sm:text-base" />
                    </span>
                    <span className="font-medium">Facebook</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 sm:gap-3 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-prompt text-slate-700 hover:bg-green-50 active:bg-green-100 transition-all"
                    onClick={shareOnLine}
                  >
                    <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-green-500 text-white shadow-md shrink-0">
                      <FaLine className="text-lg sm:text-xl" />
                    </span>
                    <span className="font-medium">LINE</span>
                  </button>
                </div>
                <div className="border-t border-slate-100 p-1.5 sm:p-2">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-prompt text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-all"
                    onClick={copyShareLink}
                  >
                    <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg bg-amber-100 text-amber-600 shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                    <span>คัดลอกข้อความ</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-prompt text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-all"
                    onClick={copyUrlOnly}
                  >
                    <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg bg-slate-100 text-slate-500 shrink-0">
                      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                    <span>คัดลอก URL</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Adopted Status Info */}
            {isAdopted && !canManageStatus && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-center">
                <p className="text-xs sm:text-sm font-semibold text-emerald-700 font-prompt flex items-center justify-center gap-1 sm:gap-1.5">
                  <span className="text-sm sm:text-base">✨</span>
                  <span className="truncate">น้อง{name}ได้บ้านใหม่แล้ว</span>
                </p>
                <p className="text-[10px] sm:text-xs text-emerald-600/70 font-prompt mt-0.5 sm:mt-1">
                  ขอบคุณทุกคนที่ให้ความสนใจ 💚
                </p>
              </div>
            )}
          </div>
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
