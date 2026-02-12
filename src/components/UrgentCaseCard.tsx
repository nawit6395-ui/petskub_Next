import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, MessageCircle, CheckCircle, Image as ImageIcon, Trash2, Heart, Eye } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useDeleteUrgentCase, useUpdateUrgentCase } from "@/hooks/useUrgentCases";
import { ImageGallery } from "./ImageGallery";
import { alert } from "@/lib/alerts";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@shared/integrations/supabase/client";

interface UrgentCaseCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  province: string;
  image_url?: string[] | null;
  contact_name: string;
  contact_phone: string;
  contact_line?: string | null;
  case_type: 'injured' | 'sick' | 'kitten' | 'other';
  is_resolved: boolean;
  user_id: string;
  created_at: string;
  views?: number;
}

const caseTypeLabels = {
  injured: "บาดเจ็บ",
  sick: "ป่วย",
  kitten: "ลูกแมว",
  other: "อื่นๆ"
};

const caseTypeColors = {
  injured: "bg-red-500",
  sick: "bg-orange-500",
  kitten: "bg-blue-500",
  other: "bg-gray-500"
};

export const UrgentCaseCard = ({
  id,
  title,
  description,
  location,
  province,
  image_url,
  contact_name,
  contact_phone,
  contact_line,
  case_type,
  is_resolved,
  user_id,
  created_at,
  views
}: UrgentCaseCardProps) => {
  const [showContact, setShowContact] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const updateUrgentCase = useUpdateUrgentCase();
  const deleteUrgentCase = useDeleteUrgentCase();

  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(id);

  // Real views logic
  const [displayViews, setDisplayViews] = useState(views || 0);

  // Increment view on mount
  useEffect(() => {
    const incrementView = async () => {
      if (!id) return;
      try {
        await supabase.rpc('increment_urgent_case_views' as any, { case_id: id });
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

  const isOwner = user?.id === user_id;
  const canManage = isOwner || isAdmin;

  const isNew = (new Date().getTime() - new Date(created_at).getTime()) / (1000 * 60 * 60 * 24) < 1; // < 1 day

  const getTimeSince = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
  };

  // SEO Schema
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product", // Improved for Rich Snippets
    "name": `เคสฉุกเฉิน: ${title} - ${province}`,
    "description": description,
    "image": image_url,
    "offers": {
      "@type": "Offer",
      "availability": is_resolved ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      "price": "0",
      "priceCurrency": "THB"
    }
  };

  const handleMarkAsResolved = async () => {
    await updateUrgentCase.mutateAsync({
      id,
      is_resolved: true,
    });
  };

  const handleDeleteCase = async () => {
    if (deleteUrgentCase.isPending) return;
    const result = await alert.confirm("ต้องการลบเคสนี้หรือไม่?", {
      description: "การลบจะเอาโพสต์นี้ออกจากทุกหน้า",
      confirmText: "ลบเคส",
    });
    if (result.isConfirmed) {
      deleteUrgentCase.mutate(id, {
        onSuccess: () => {
          alert.success('ลบเคสฉุกเฉินแล้ว');
        },
        onError: (error) => {
          alert.error('ไม่สามารถลบเคสได้', {
            description: error.message,
          });
        },
      });
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className={`media-frame h-[185px] sm:h-[210px] ${is_resolved ? 'ring-2 ring-emerald-200' : ''} relative`}>
          {image_url && image_url.length > 0 ? (
            <Image
              src={image_url[0]}
              alt={`ช่วยเหลือสัตว์ ${caseTypeLabels[case_type]} ${title} ${province} - Petskub`}
              fill
              className={`object-cover transition duration-300 ${image_url.length > 1 ? 'cursor-pointer group-hover:scale-105' : ''} ${is_resolved ? 'brightness-75' : ''}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onClick={() => image_url.length > 1 && setGalleryOpen(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground bg-slate-50">
              <ImageIcon className="w-10 h-10" />
              <p className="text-xs font-prompt">ยังไม่มีรูปประกอบ</p>
            </div>
          )}

          {/* New Badge */}
          {isNew && !is_resolved && (
            <div className="absolute top-2 left-2 z-10">
              <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full px-2 py-0.5 shadow-md animate-pulse">
                NEW
              </span>
            </div>
          )}

          {/* Favorite Button */}
          {!isOwner && !is_resolved && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  alert.error('กรุณาเข้าสู่ระบบ', {
                    description: 'คุณต้องเข้าสู่ระบบเพื่อบันทึกรายการโปรด'
                  });
                  return;
                }
                toggleFavorite(id, title);
              }}
              className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm transition-all active:scale-95 group/fav"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover/fav:text-rose-500"}`}
              />
            </button>
          )}

          {image_url && image_url.length > 1 && (
            <Badge
              className="absolute bottom-3 left-3 bg-black/60 text-white border-0 font-prompt cursor-pointer text-[11px] px-2.5 py-0.5"
              onClick={() => setGalleryOpen(true)}
            >
              📷 {image_url.length}
            </Badge>
          )}

          {/* Status Badge */}
          {is_resolved && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
              <Badge variant="secondary" className="text-lg font-prompt px-4 py-2 bg-white/90 text-emerald-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                ได้รับการช่วยเหลือแล้ว
              </Badge>
            </div>
          )}

          {/* Case Type Badge (Moved down if favorite button exists, but absolute positioning handles it) */}
          <div className="absolute top-2 right-10 flex items-center gap-2">
            <Badge className={`${caseTypeColors[case_type]} text-white font-prompt text-xs px-2 py-0.5 shadow-sm`}>
              {caseTypeLabels[case_type]}
            </Badge>
          </div>

          {isAdmin && (
            <div className="absolute top-2 right-20"> {/* Adjusted position */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full bg-white/90 text-destructive hover:text-destructive shadow-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteCase();
                }}
                disabled={deleteUrgentCase.isPending}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">ลบเคสนี้</span>
              </Button>
            </div>
          )}
        </div>

        <CardHeader className="p-2 sm:p-3 pb-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="font-prompt text-sm sm:text-base truncate leading-tight">{title}</CardTitle>
              <CardDescription className="font-prompt flex items-center gap-1 mt-1 text-xs text-slate-500">
                <Link href={`/urgent-cases?province=${province}`} className="flex items-center gap-1 hover:text-orange-500 hover:underline transition-colors truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-orange-400" />
                  <span className="truncate">{location}, {province}</span>
                </Link>
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] sm:text-xs text-slate-400 font-prompt whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded-md">
                {getTimeSince(created_at)}
              </span>
              {!is_resolved && (
                <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-prompt">
                  <Eye className="w-3 h-3" /> {displayViews}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 p-2 sm:p-3 pt-2">
          <p className="text-xs sm:text-sm text-slate-600 font-prompt line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Contact Information */}
          {!showContact ? (
            <Button
              onClick={() => {
                if (!user) {
                  alert.error('กรุณาเข้าสู่ระบบเพื่อดูข้อมูลติดต่อ');
                  return;
                }
                setShowContact(true);
              }}
              variant="outline"
              size="sm"
              className="w-full font-prompt text-xs h-7 sm:h-8 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              ดูข้อมูลติดต่อ
            </Button>
          ) : (
            <div className="space-y-1 p-2 bg-orange-50/50 rounded-lg border border-orange-100 animate-in fade-in zoom-in-95 duration-200">
              <p className="font-prompt text-[10px] sm:text-xs">
                <strong>ผู้ติดต่อ:</strong> {contact_name}
              </p>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-500" />
                <a
                  href={`tel:${contact_phone}`}
                  className="text-xs text-emerald-600 hover:underline font-prompt font-medium"
                >
                  {contact_phone}
                </a>
              </div>
              {contact_line && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-prompt text-slate-600">Line: {contact_line}</span>
                </div>
              )}
            </div>
          )}

          {/* Management Buttons */}
          {canManage && !is_resolved && (
            <div className="pt-2 border-t border-slate-100 mt-2">
              <Button
                onClick={handleMarkAsResolved}
                variant="default"
                size="sm"
                className="w-full font-prompt text-[10px] sm:text-xs h-7 sm:h-8 bg-emerald-500 hover:bg-emerald-600"
                disabled={updateUrgentCase.isPending}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">ได้รับการช่วยเหลือแล้ว</span>
                <span className="sm:hidden">แก้ไขแล้ว</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {image_url && image_url.length > 0 && (
        <ImageGallery
          images={image_url}
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
        />
      )}
    </>
  );
};
