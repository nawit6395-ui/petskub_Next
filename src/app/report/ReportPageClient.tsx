"use client";

import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Send,
  Navigation,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCreateReport, useReports } from "@/shared/hooks/useReports";
import type { Report as ReportType } from "@/shared/hooks/useReports";
import { alert } from "@/lib/alerts";
import { THAI_PROVINCES } from "@/constants/thaiProvinces";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import type { Coordinates } from "@/lib/leaflet";
import {
  defaultMapCenter,
  tileLayerUrl,
  tileLayerOptions,
  locationMarkerIcon,
  openMarkerPopup,
  closeMarkerPopup,
  pinMarkerPopup,
  releaseMarkerPopup,
} from "@/lib/leaflet";
import ReportMapOverview from "@/components/ReportMapOverview";

const reportSchema = z.object({
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z
    .string()
    .trim()
    .min(1, "กรุณากรอกเขต/อำเภอ")
    .max(100, "เขต/อำเภอต้องไม่เกิน 100 ตัวอักษร"),
  location: z
    .string()
    .trim()
    .min(1, "กรุณากรอกสถานที่")
    .max(200, "สถานที่ต้องไม่เกิน 200 ตัวอักษร"),
  description: z.string().max(1000, "รายละเอียดต้องไม่เกิน 1000 ตัวอักษร").optional(),
});

const mapButtonClass = "bg-[#b54708] text-white hover:bg-[#93310a] shadow-md hover:shadow-lg border-transparent";

const ReportPageClient = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { data: reports = [] } = useReports();
  const createReport = useCreateReport();

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [species, setSpecies] = useState<"dog" | "cat" | "other" | "">("");
  const [condition, setCondition] = useState<"normal" | "injured" | "pregnant" | "aggressive" | "">("");
  const [collar, setCollar] = useState<"yes" | "no" | "">("");

  const reverseGeocode = useCallback(
    async (coords: Coordinates) => {
      const setCoordsFallback = () => {
        if (!location) setLocation(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
      };

      const cleanDistrictString = (value?: string | null) => {
        if (!value) return "";
        let v = String(value).trim();
        v = v.replace(/^\s*\d{5}\s*[-,]?\s*/g, "");
        v = v.replace(/^\s*(รหัสไปรษณีย์|zipcode)\s*/i, "");
        v = v.trim();
        v = v.replace(/,?\s*(ประเทศไทย|Thailand)\s*$/i, "");
        if (/^\d+$/.test(v)) return "";
        if (v.length <= 1) return "";
        return v;
      };

      const extractDistrictFromParts = (parts: string[]) => {
        const explicit = parts.find((p) => /(เขต|อำเภอ|แขวง|ตำบล|อ\.|ต\.)/u.test(p));
        if (explicit) {
          const cleaned = cleanDistrictString(explicit);
          if (cleaned && !/^(ประเทศไทย|Thailand)$/i.test(cleaned)) return cleaned;
        }

        const provIndex = parts.findIndex((p) => THAI_PROVINCES.some((pv) => p.includes(pv)));
        if (provIndex > 0) {
          const candidate = parts[provIndex - 1];
          const cleaned = cleanDistrictString(candidate);
          if (cleaned && !(THAI_PROVINCES as readonly string[]).includes(cleaned)) return cleaned;
        }

        const fallback = parts.find((p) => {
          const t = p.trim();
          if (!t) return false;
          if (/^\d+$/.test(t)) return false;
          if (/^\d{1,4}\//.test(t)) return false;
          if (/^[0-9]{1,5}\s/.test(t)) return false;
          if (/^(ประเทศไทย|Thailand)$/i.test(t)) return false;
          if (THAI_PROVINCES.some((pv) => t.includes(pv))) return false;
          return t.length <= 40;
        });
        const cleanedFallback = cleanDistrictString(fallback || "");
        if (cleanedFallback) return cleanedFallback;
        for (const p of parts) {
          const c = cleanDistrictString(p);
          if (c && !/^(ประเทศไทย|Thailand)$/i.test(c) && !(THAI_PROVINCES as readonly string[]).includes(c)) return c;
        }
        return "";
      };

      interface ReverseGeocodeResponse {
        address?: {
          state?: string;
          district?: string;
          county?: string;
          city_district?: string;
          city?: string;
          town?: string;
          village?: string;
          suburb?: string;
          hamlet?: string;
          municipality?: string;
          state_district?: string;
          [key: string]: string | undefined;
        };
        display_name?: string;
      }

      try {
        const url = new URL("/api/reverse-geocode", window.location.origin);
        url.searchParams.set("lat", coords.lat.toString());
        url.searchParams.set("lon", coords.lng.toString());
        url.searchParams.set("lang", "th");

        const response = await fetch(url.toString());
        if (response.ok) {
          const data = (await response.json()) as ReverseGeocodeResponse;
          const address = data.address ?? {};
          if (address.state) setProvince(address.state);
          const districtCandidates = [
            address.district,
            address.county,
            address.city_district,
            address.city,
            address.town,
            address.village,
            address.suburb,
            address.hamlet,
            address.municipality,
            address.state_district,
          ];
          const firstDistrict = districtCandidates.find((v): v is string => typeof v === "string" && v.trim().length > 0);
          if (firstDistrict) setDistrict(firstDistrict as string);
          if (data.display_name) setLocation(data.display_name);
          if ((!district || district.trim().length === 0) && data.display_name) {
            try {
              const full = String(data.display_name);
              const re = /(?:\d{5}\s*,?\s*)?(เขต|อำเภอ|แขวง|ตำบล|อ\.|ต\.)\s*([^,]+)/u;
              const m = full.match(re);
              if (m && m[1] && m[2]) {
                const candidate = `${m[1]} ${m[2].trim()}`.trim();
                const cleaned = cleanDistrictString(candidate);
                if (cleaned) setDistrict(cleaned);
              } else {
                const parts = full.split(",").map((p) => p.trim()).filter(Boolean);
                const extracted = extractDistrictFromParts(parts);
                if (extracted) setDistrict(extracted);
                if ((!province || province.trim().length === 0) && parts.length > 0) {
                  const foundProv = THAI_PROVINCES.find((pv) => parts.some((part) => part.includes(pv)));
                  if (foundProv) setProvince(foundProv);
                }
              }
            } catch (parseErr) {
              console.warn("[reverseGeocode] failed parsing display_name", parseErr);
            }
          }
          return;
        }
      } catch (err) {
        console.warn("reverse-geocode request failed", err);
      }

      setCoordsFallback();
    },
    [district, location, province]
  );

  const handleCoordinatesChange = useCallback(
    (coords: Coordinates, options?: { reverse?: boolean }) => {
      setCoordinates(coords);
      setGeoStatus(`ละติจูด ${coords.lat.toFixed(5)}, ลองจิจูด ${coords.lng.toFixed(5)}`);
      if (options?.reverse) {
        void reverseGeocode(coords);
      }
    },
    [reverseGeocode]
  );

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert.error("เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง");
      return;
    }

    const getCurrentPositionAsync = () =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

    (async () => {
      setIsLocating(true);
      try {
        const position = await getCurrentPositionAsync();
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude } as Coordinates;
        handleCoordinatesChange(coords, { reverse: true });
      } catch (err: unknown) {
        let msg = "Unknown error";
        if (err instanceof Error) msg = err.message;
        else if (typeof err === "string") msg = err;
        alert.error("ไม่สามารถดึงตำแหน่งได้", { description: msg });
      } finally {
        setIsLocating(false);
      }
    })();
  }, [handleCoordinatesChange]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!coordinates) {
      alert.error("กรุณาเลือกตำแหน่งบนแผนที่ก่อนส่งรายงาน");
      return;
    }

    try {
      const validated = reportSchema.parse({ province, district, location, description });

      const speciesLabel =
        species === "dog"
          ? "หมา"
          : species === "cat"
            ? "แมว"
            : species === "other"
              ? "อื่นๆ"
              : "";
      const conditionLabel =
        condition === "normal"
          ? "ปกติ"
          : condition === "injured"
            ? "บาดเจ็บ/ป่วย"
            : condition === "pregnant"
              ? "ตั้งครรภ์/ลูกอ่อน"
              : condition === "aggressive"
                ? "ดุร้าย"
                : "";
      const collarLabel = collar === "yes" ? "มี" : collar === "no" ? "ไม่มี" : "";

      const tags: string[] = [];
      if (speciesLabel) tags.push(`ชนิด: ${speciesLabel}`);
      if (conditionLabel) tags.push(`สภาพ: ${conditionLabel}`);
      if (collarLabel) tags.push(`ปลอกคอ: ${collarLabel}`);
      const tagsString = tags.length > 0 ? `${tags.join(" | ")}\n\n` : "";

      const payload: Partial<ReportType> = {
        province: validated.province,
        district: validated.district,
        location: validated.location,
        description: tagsString + (validated.description || ""),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        cat_count: 1,
        status: "pending",
        user_id: user.id,
      };

      if (imageUrls && imageUrls.length > 0) {
        payload.photo_urls = imageUrls;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createReport.mutateAsync(payload as any); // Cast for mutation strictness if needed, or refine useCreateReport

      setProvince("");
      setDistrict("");
      setLocation("");
      setDescription("");
      setCoordinates(null);
      setGeoStatus(null);
      setSpecies("");
      setCondition("");
      setCollar("");
      setImageUrls([]);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => alert.error(err.message));
      } else {
        alert.error("ไม่สามารถส่งรายงานได้ โปรดลองอีกครั้ง");
      }
    }
  };

  const activeReports = reports.filter((report) => report.status !== "resolved");

  const photosOf = (report: ReportType): string[] => {
    if (!report.photo_urls) return [];
    return Array.isArray(report.photo_urls)
      ? report.photo_urls
      : typeof report.photo_urls === "string"
        ? [report.photo_urls]
        : [];
  };


  const StepTitle = ({ number, title }: { number: number; title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold font-heading">
        {number}
      </div>
      <h2 className="font-heading text-lg font-bold text-gray-900">{title}</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Orange Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 pt-28 pb-32 rounded-b-[3rem] px-4 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="paw-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M12,2c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S10.9,2,12,2z M6,6C7.1,6,8,6.9,8,8s-0.9,2-2,2s-2-0.9-2-2S4.9,6,6,6z M18,6 c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S16.9,6,18,6z M12,8c2.2,0,4,1.8,4,4s-1.8,4-4,4s-4-1.8-4-4S9.8,8,12,8z" fill="currentColor" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#paw-pattern)" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2 flex items-center justify-center gap-2">
            แจ้งพบสัตว์จรจัด <MapIcon className="h-8 w-8 text-white/90" />
          </h1>
          <p className="text-orange-100 font-nav max-w-lg mx-auto">
            ช่วยกันเป็นหูเป็นตา เพื่อสวัสดิภาพที่ดีกว่าของเพื่อนร่วมโลก
          </p>
        </div>
      </div>

      {/* Main Floating Card */}
      <div className="container mx-auto max-w-3xl px-4 -mt-20 relative z-20">
        <Card className="bg-white rounded-[2rem] shadow-xl p-6 md:p-8 border-0">
          {!user && (
            <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4 text-center font-nav text-sm text-orange-800">
              <span className="mr-1">👋</span>
              <Link href="/login" className="font-semibold underline hover:text-orange-600">เข้าสู่ระบบ</Link> เพื่อติดตามสถานะรายงานของคุณได้สะดวกขึ้น
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Step 1: Location */}
            <section>
              <StepTitle number={1} title="ระบุตำแหน่งที่พบ" />

              <div className="space-y-4">
                {/* Map */}
                <div className="h-64 md:h-72 w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 relative group transition-all hover:border-orange-300">
                  <MapContainer
                    key={`${coordinates?.lat ?? defaultMapCenter.lat}-${coordinates?.lng ?? defaultMapCenter.lng}`}
                    center={coordinates ?? defaultMapCenter}
                    zoom={coordinates ? 16 : 6}
                    scrollWheelZoom={false} // Prevent scrolling page
                    className="h-full w-full z-10"
                  >
                    <TileLayer url={tileLayerUrl} {...tileLayerOptions} />
                    {coordinates && (
                      <Marker
                        icon={locationMarkerIcon}
                        position={coordinates}
                        eventHandlers={{
                          click: pinMarkerPopup,
                        }}
                      >
                        <Popup>จุดที่พบ</Popup>
                      </Marker>
                    )}
                    <MapClickHandler onSelect={(latlng) => handleCoordinatesChange(latlng, { reverse: true })} />
                  </MapContainer>
                  {!coordinates && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000] bg-black/5">
                      <div className="bg-white/90 px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> แตะเพื่อระบุพิกัดบนแผนที่
                      </div>
                    </div>
                  )}
                </div>

                {/* Get Location Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="w-full bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 hover:text-blue-700 h-12 rounded-xl font-nav font-medium gap-2 transition-all shadow-sm"
                >
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? "กำลังระบุตำแหน่ง..." : "ใช้ตำแหน่งปัจจุบันของฉัน"}
                </Button>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-gray-600 font-nav text-xs font-bold uppercase tracking-wider ml-1">จังหวัด</Label>
                    <Select value={province} onValueChange={setProvince} required>
                      <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-orange-500/20 font-nav" aria-label="เลือกจังหวัด">
                        <SelectValue placeholder="เลือกจังหวัด" />
                      </SelectTrigger>
                      <SelectContent>
                        {THAI_PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-600 font-nav text-xs font-bold uppercase tracking-wider ml-1">เขต / อำเภอ</Label>
                    <Input
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="เช่น ดินแดง"
                      className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-orange-500/20 font-nav"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-gray-600 font-nav text-xs font-bold uppercase tracking-wider ml-1">จุดสังเกต / สถานที่ใกล้เคียง</Label>
                  <Input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="เช่น หน้าเซเว่นฯ ปากซอย 5, ใกล้วินมอเตอร์ไซค์"
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-orange-500/20 font-nav"
                    required
                  />
                </div>
              </div>
            </section>

            <div className="h-px bg-gray-100 w-full" />

            {/* Step 2: Photos */}
            <section>
              <StepTitle number={2} title="รูปถ่ายสัตว์ (ถ้ามี)" />
              <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-8 hover:bg-gray-100/50 transition-colors">
                <MultiImageUpload
                  imageUrls={imageUrls}
                  onImagesChange={setImageUrls}
                  userId={user?.id ?? "anon"}
                  maxImages={5}
                />
              </div>
              <p className="text-center text-xs text-gray-500 mt-2 font-nav">
                รองรับไฟล์ PNG, JPG (ไม่เกิน 5MB) • อัปโหลดได้สูงสุด 5 รูป
              </p>
            </section>

            <div className="h-px bg-gray-100 w-full" />

            {/* Step 3: Details */}
            <section>
              <StepTitle number={3} title="ข้อมูลสัตว์เพิ่มเติม" />

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-gray-600 font-nav text-sm font-semibold ml-1">ชนิดสัตว์</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dog', label: 'สุนัข', icon: '🐕' },
                      { id: 'cat', label: 'แมว', icon: '🐈' },
                      { id: 'other', label: 'อื่นๆ', icon: '🐇' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSpecies(item.id as "dog" | "cat" | "other")}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${species === item.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold shadow-sm'
                          : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-sm font-nav">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-600 font-nav text-sm font-semibold ml-1">สภาพสัตว์ / อาการ</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'normal', label: 'ปกติ', emoji: '😐' },
                      { id: 'injured', label: 'บาดเจ็บ', emoji: '🤕' },
                      { id: 'aggressive', label: 'ดุร้าย', emoji: '👹' },
                      { id: 'pregnant', label: 'ตั้งครรภ์/ลูกอ่อน', emoji: '🤱' },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCondition(item.id as "normal" | "injured" | "pregnant" | "aggressive")}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all ${condition === item.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold shadow-sm ring-1 ring-orange-500/20'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-600'
                          }`}
                      >
                        <span className="text-base">{item.emoji}</span>
                        <span className="text-xs md:text-sm font-nav">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-600 font-nav text-sm font-semibold ml-1">รายละเอียดเพิ่มเติม</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="เช่น สี, ปลอกคอ, พฤติกรรมเด่น หรือเบาะแสอื่นๆ ที่เป็นประโยชน์"
                    className="rounded-2xl bg-gray-50 border-gray-200 focus:ring-orange-500/20 font-nav min-h-[100px] resize-y"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-14 text-lg font-heading rounded-2xl bg-orange-700 hover:bg-orange-800 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:-translate-y-0.5"
                disabled={createReport.isPending}
              >
                {createReport.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    กำลังบันทึกข้อมูล...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-3" />
                    แจ้งรายงานทันที
                  </>
                )}
              </Button>
            </div>

          </form>

        </Card>

        {/* Recent Reports & Stats Section */}
        <div className="mt-16 space-y-12 pb-20">

          {/* Recent Reports Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold font-heading text-gray-800">รายงานล่าสุด</h2>
              <Link href="/reports/map" className="text-orange-700 font-nav text-sm font-semibold flex items-center gap-1 hover:underline">
                <MapIcon className="w-4 h-4" /> ดูทั้งหมดบนแผนที่
              </Link>
            </div>

            {/* Recent Reports Grid */}
            {reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reports.slice(0, 3).map((report) => {
                  const photos = photosOf(report);
                  return (
                    <Card key={report.id} className="border-0 shadow-lg rounded-[1.5rem] overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
                      {/* Image/Map Area */}
                      <div className="h-48 relative bg-gray-100">
                        {photos.length > 0 ? (
                          <ReportPhotoDialog report={{ ...report, photo_urls: photos }} />
                        ) : report.latitude && report.longitude ? (
                          <ReportPreviewMap latitude={report.latitude} longitude={report.longitude} />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 font-nav text-sm">
                            ไม่มีรูปภาพ
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-1.5 bg-orange-100/50 rounded-full text-orange-600">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-gray-800">พบสัตว์จร {report.cat_count} ตัว</h3>
                            <p className="text-sm text-gray-500 font-nav line-clamp-2 mt-1">{report.location}</p>
                            {report.latitude && report.longitude && (
                              <a
                                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 font-nav text-xs text-orange-700 underline underline-offset-2 hover:text-orange-800"
                              >
                                ดูบน Google Maps (lat {report.latitude.toFixed(3)}, lng {report.longitude.toFixed(3)})
                              </a>
                            )}
                          </div>
                        </div>
                        <Button asChild variant="secondary" className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border-0 rounded-xl font-nav font-medium">
                          <Link href={`/reports/map?focus=${report.id}`}>
                            ดูกบนแผนที่
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-400 font-nav">ยังไม่มีรายงานในขณะนี้</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MapClickHandler = ({ onSelect }: { onSelect: (coords: Coordinates) => void }) => {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    },
  });
  return null;
};

const ReportPreviewMap = ({ latitude, longitude }: { latitude: number; longitude: number }) => (
  <MapContainer
    key={`${latitude}-${longitude}`}
    center={{ lat: latitude, lng: longitude }}
    zoom={15}
    scrollWheelZoom={false}
    dragging={false}
    doubleClickZoom={false}
    zoomControl={false}
    className="relative z-0 h-full w-full"
  >
    <TileLayer url={tileLayerUrl} {...tileLayerOptions} />
    <Marker
      icon={locationMarkerIcon}
      position={{ lat: latitude, lng: longitude }}
    />
  </MapContainer>
);

const ReportPhotoDialog = ({ report }: { report: ReportType & { photo_urls: string[] } }) => {
  const photoCount = report.photo_urls?.length ?? 0;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (photoCount === 0 || !report.photo_urls) {
    return null;
  }

  const showPrev = () => setActiveIndex((prev) => (prev - 1 + photoCount) % photoCount);
  const showNext = () => setActiveIndex((prev) => (prev + 1) % photoCount);
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setActiveIndex(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="relative h-full w-full overflow-hidden focus-visible:outline-none bg-gray-100 group"
          aria-label="ดูภาพทั้งหมด"
        >
          <Image
            src={report.photo_urls[0]}
            alt={`ภาพประกอบรายงาน ${report.location}`}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            ภาพจากผู้แจ้ง
          </span>
          {photoCount > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-orange-600 shadow-sm">
              ดูทั้งหมด {photoCount} ภาพ
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl sm:max-w-2xl bg-black/95 border-0 text-white p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>ภาพจากผู้แจ้ง</DialogTitle>
          <DialogDescription>ดูรูปภาพขยายใหญ่ของรายงาน</DialogDescription>
        </DialogHeader>
        <div className="relative h-[60vh] md:h-[80vh] flex items-center justify-center">
          <Image
            src={report.photo_urls[activeIndex]}
            alt={`ภาพที่ ${activeIndex + 1} ของรายงาน ${report.location}`}
            className="object-contain"
            fill
            sizes="100vw"
            quality={90}
            priority
          />

          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50">
            <div>
              <h3 className="font-prompt font-bold text-lg">{report.district}</h3>
              <p className="text-sm text-gray-300">{report.location}</p>
            </div>
            <div className="bg-black/50 px-3 py-1 rounded-full text-xs font-bold">
              {activeIndex + 1} / {photoCount}
            </div>
          </div>

          {photoCount > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 backdrop-blur-md transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 backdrop-blur-md transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPageClient;
