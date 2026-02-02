"use client";

import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { useCats } from "@/shared/hooks/useCats";
import CatCard from "@/components/CatCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THAI_PROVINCES } from "@/constants/thaiProvinces";

const SuccessStoriesPage = () => {
  const { data: cats, isLoading } = useCats();
  const [searchTerm, setSearchTerm] = useState("");
  const [provinceFilter, setProvinceFilter] = useState<string>("all");

  const adoptedCats = cats?.filter((cat) => cat.is_adopted) || [];

  const filteredCats = adoptedCats.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = provinceFilter === "all" || cat.province === provinceFilter;
    return matchesSearch && matchesProvince;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 animate-pulse text-success" />
            <h1 className="bg-gradient-to-r from-success to-success/60 bg-clip-text text-4xl font-bold text-transparent font-prompt">
              สัตว์เลี้ยงที่ได้บ้านใหม่แล้ว
            </h1>
            <Heart className="h-8 w-8 animate-pulse text-success fill-success" />
          </div>
          <p className="mx-auto max-w-2xl text-lg font-prompt text-muted-foreground">
            หมาหาบ้านและแมวหาบ้านที่ได้รับเลี้ยงแล้ว 🏡 ขอบคุณทุกท่านที่รับเลี้ยงสุนัขและรับเลี้ยงแมวจาก Petskub ให้ความรักและโอกาสครั้งใหม่กับพวกเขา
          </p>
          {adoptedCats.length > 0 && (
            <p className="mt-2 font-prompt font-semibold text-success">
              🎉 {adoptedCats.length} ชีวิตที่ได้รับความรัก
            </p>
          )}
        </div>

        {adoptedCats.length > 0 && (
          <div className="mb-8 mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                placeholder="🔍 ค้นหาชื่อสัตว์เลี้ยง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="font-prompt"
              />
              <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                <SelectTrigger className="font-prompt">
                  <SelectValue placeholder="เลือกจังหวัด" />
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
            </div>
          </div>
        )}

        {isLoading && (
          <div className="py-12 text-center">
            <p className="font-prompt text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {!isLoading && adoptedCats.length === 0 && (
          <div className="rounded-xl border-2 border-dashed bg-card py-12 text-center">
            <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="mb-2 text-xl font-semibold font-prompt">ยังไม่มีเรื่องราวความสำเร็จ</h3>
            <p className="font-prompt text-muted-foreground">
              เมื่อมีสัตว์เลี้ยงได้บ้านใหม่ เรื่องราวจะปรากฏที่นี่
            </p>
          </div>
        )}

        {!isLoading && adoptedCats.length > 0 && filteredCats.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-prompt text-muted-foreground">ไม่พบผลลัพธ์ที่ค้นหา</p>
          </div>
        )}

        {filteredCats.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCats.map((cat) => (
              <CatCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                age={cat.age}
                gender={cat.gender}
                province={cat.province}
                district={cat.district}
                images={cat.image_url}
                story={cat.story}
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
        )}
      </div>
    </div>
  );
};

export default SuccessStoriesPage;
