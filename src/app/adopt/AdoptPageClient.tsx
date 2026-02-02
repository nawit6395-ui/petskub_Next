"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CatCard from "@/components/CatCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { useCats } from "@/shared/hooks/useCats";
import { THAI_PROVINCES } from "@/constants/thaiProvinces";
import adoptHeroPrimaryPicture from "@/assets/hero-cat.jpg";
import adoptHeroSecondaryPicture from "@/assets/hero-cat-pastel.jpg";
import adoptHeroDetailPicture from "@/assets/knowledge-cat-relaxing.jpg";
import adoptHeroMoodPicture from "@/assets/knowledge-cat-body-language.jpg";
import adoptHeroSnackPicture from "@/assets/knowledge-cat-food.jpg";
import { ResponsivePicture } from "@/components/ResponsivePicture";

const AdoptPageClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("available");
  const { data: cats, isLoading } = useCats();

  const availableCount = useMemo(() => cats?.filter((cat) => !cat.is_adopted).length ?? 0, [cats]);
  const totalCats = cats?.length ?? 0;

  const filteredCats = useMemo(() => {
    if (!cats) return [];
    const term = searchTerm.trim().toLowerCase();
    return cats.filter((cat) => {
      const matchesSearch = !term || cat.name.toLowerCase().includes(term);
      const matchesProvince = provinceFilter === "all" || cat.province === provinceFilter;
      const matchesGender = genderFilter === "all" || cat.gender === genderFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && !cat.is_adopted) ||
        (statusFilter === "adopted" && cat.is_adopted);
      return matchesSearch && matchesProvince && matchesGender && matchesStatus;
    });
  }, [cats, searchTerm, provinceFilter, genderFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 text-center lg:text-left">
            <div>
              <h1 className="mb-3 text-4xl font-bold font-prompt">รวมประกาศสุนัขหาบ้าน และ แมวหาบ้าน 🏠</h1>
              <p className="text-base text-muted-foreground font-prompt sm:text-lg">
                ทาสแมวและคนรักหมาห้ามพลาด! น้องหมาน้องเหมียวขี้อ้อน ลูกสุนัขแจกฟรี ลูกแมวหาบ้าน หลากหลายสีสัน รอให้คุณมารับไปดูแล ค้นหารับเลี้ยงสุนัข รับเลี้ยงแมว ใกล้บ้านคุณ
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <div className="chip-soft-amber">📸 ภาพทุกใบใช้กรอบแสดงผลใหม่</div>
              <div className="chip-soft-emerald">✅ ตรวจข้อมูลสุขภาพ &amp; สถานะฉีดวัคซีน</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2">
              <span className="text-sm font-prompt">💡 ต้องการโพสต์หาบ้านให้แมวหรือสุนัข?</span>
              <Link href="/login" className="text-sm font-semibold text-orange-700 hover:underline font-prompt">
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[340px] items-center justify-center lg:justify-end">
            <div className="absolute inset-0 -z-10 rounded-[48px] bg-gradient-to-br from-amber-50 via-white to-emerald-50 blur-2xl opacity-80" />

            <div className="media-frame h-[260px] w-full max-w-[520px] sm:h-[320px]">
              <ResponsivePicture
                picture={adoptHeroPrimaryPicture}
                alt="แมวหาบ้านน่ารักรอรับเลี้ยง-Petskub-กรุงเทพ"
                sizes="(max-width: 1024px) 100vw, 520px"
                loading="eager"
                decoding="async"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
              <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-2xl bg-black/55 px-4 py-3 text-[11px] font-prompt text-white shadow-lg sm:text-sm">
                <span className="flex items-center gap-2">
                  🐾 โปรไฟล์ใหม่สัปดาห์นี้
                  <strong className="text-white">12 ตัว</strong>
                </span>
                <span className="text-white/80">อัปเดต {new Date().toLocaleDateString("th-TH")}</span>
              </div>
            </div>

            <div className="absolute -left-10 top-4 hidden w-[150px] -rotate-2 flex-col gap-3 drop-shadow-lg sm:flex">
              <div className="media-frame-sm h-[120px]">
                <ResponsivePicture
                  picture={adoptHeroSecondaryPicture}
                  alt="ลูกแมวหาบ้านได้บ้านใหม่แล้ว-Petskub"
                  sizes="(max-width: 768px) 60vw, 180px"
                  loading="lazy"
                  decoding="async"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
              <div className="media-frame-sm h-[110px] rotate-3">
                <ResponsivePicture
                  picture={adoptHeroDetailPicture}
                  alt="น้องแมวกำลังพักผ่อน"
                  sizes="(max-width: 768px) 60vw, 180px"
                  loading="lazy"
                  decoding="async"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="absolute -right-10 bottom-2 hidden w-[190px] flex-col gap-4 md:flex">
              <div className="rounded-3xl border border-white/60 bg-white/90 p-4 text-center shadow-lg">
                <p className="mb-1 text-xs font-prompt text-muted-foreground">ยอดการรับเลี้ยงเดือนนี้</p>
                <p className="text-2xl font-semibold text-slate-900">38 ครอบครัว</p>
                <p className="text-[11px] font-prompt text-emerald-600">+12% จากเดือนก่อน</p>
              </div>
              <div className="media-frame-sm h-[120px] rotate-3">
                <ResponsivePicture
                  picture={adoptHeroMoodPicture}
                  alt="น้องแมวกำลังเล่น"
                  sizes="(max-width: 1024px) 60vw, 220px"
                  loading="lazy"
                  decoding="async"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="absolute -bottom-10 left-1/2 w-[220px] -translate-x-1/2 rounded-3xl border border-white/40 bg-white/90 px-5 py-4 text-center shadow-xl sm:hidden">
              <p className="text-xs font-prompt text-muted-foreground">ดูโปรไฟล์น้องแมวทั้งหมด</p>
              <p className="text-xl font-semibold text-foreground">{totalCats}+ รายการ</p>
            </div>

            <div className="absolute -left-6 -bottom-8 hidden w-[170px] -rotate-3 flex-col gap-3 lg:flex">
              <div className="media-frame-sm h-[110px]">
                <ResponsivePicture
                  picture={adoptHeroSnackPicture}
                  alt="ของโปรดน้องแมว"
                  sizes="(max-width: 1024px) 50vw, 200px"
                  loading="lazy"
                  decoding="async"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
              <div className="rounded-3xl border border-white/60 bg-white/90 p-3 text-center shadow-md">
                <p className="text-[11px] font-prompt text-muted-foreground">พร้อมรับเลี้ยงทันที</p>
                <p className="text-lg font-semibold text-slate-900">{availableCount} ตัว</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold font-prompt">ค้นหาและกรองสัตว์เลี้ยง</h2>
          <p className="text-muted-foreground font-prompt">พบกับน้องแมวและสุนัขที่รอคุณอยู่</p>
        </div>

        <div className="mb-8 rounded-2xl bg-card p-4 shadow-card sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h2 className="font-semibold font-prompt">กรองการค้นหา</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อสัตว์เลี้ยง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-prompt"
              />
            </div>

            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger className="font-prompt" aria-label="เลือกจังหวัด">
                <SelectValue placeholder="จังหวัด" />
              </SelectTrigger>
              <SelectContent className="max-h-64 overflow-y-auto">
                <SelectItem value="all" className="font-prompt">
                  ทุกจังหวัด
                </SelectItem>
                {THAI_PROVINCES.map((province) => (
                  <SelectItem key={province} value={province} className="font-prompt">
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="font-prompt" aria-label="เลือกเพศ">
                <SelectValue placeholder="เพศ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-prompt">
                  ทุกเพศ
                </SelectItem>
                <SelectItem value="ชาย" className="font-prompt">
                  ชาย
                </SelectItem>
                <SelectItem value="หญิง" className="font-prompt">
                  หญิง
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="font-prompt" aria-label="เลือกสถานะ">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-prompt">
                  ทุกสถานะ
                </SelectItem>
                <SelectItem value="available" className="font-prompt">
                  พร้อมรับเลี้ยง
                </SelectItem>
                <SelectItem value="adopted" className="font-prompt">
                  รับเลี้ยงแล้ว
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="space-y-4 animate-pulse">
              <div className="mx-auto h-8 w-48 rounded bg-muted" />
              <div className="mx-auto h-4 w-32 rounded bg-muted" />
            </div>
          </div>
        ) : !cats || cats.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center">
            <p className="mb-4 font-prompt text-muted-foreground">ยังไม่มีข้อมูลสัตว์เลี้ยงในระบบ</p>
            <Link href="/add-cat">
              <Button className="font-prompt">เพิ่มข้อมูลสัตว์เลี้ยงตัวแรก</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 font-prompt text-muted-foreground">พบ {filteredCats.length} ตัว</div>

            {filteredCats.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                {filteredCats.map((cat) => (
                  <CatCard
                    key={cat.id}
                    id={cat.id}
                    name={cat.name}
                    age={cat.age}
                    province={cat.province}
                    district={cat.district}
                    images={cat.image_url ?? []}
                    story={cat.story}
                    gender={cat.gender}
                    isAdopted={cat.is_adopted}
                    urgent={cat.is_urgent}
                    contactName={cat.contact_name}
                    contactPhone={cat.contact_phone}
                    contactLine={cat.contact_line}
                    userId={cat.user_id}
                    healthStatus={cat.health_status}
                    isSterilized={cat.is_sterilized}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="font-prompt text-muted-foreground">ไม่พบสัตว์เลี้ยงที่ตรงกับเงื่อนไขการค้นหา</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdoptPageClient;
