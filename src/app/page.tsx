"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MapPin, Heart, TrendingUp } from "lucide-react";
import { FaHeart, FaCat, FaMapMarkerAlt, FaExclamationTriangle } from "react-icons/fa";
import CatCard from "@/components/CatCard";
import Link from "next/link";
import heroImageCozyPicture from "@/assets/hero-cat.jpg"; // Static import is good for next/image
import { useCats } from "@/shared/hooks/useCats";
import { useReports } from "@/shared/hooks/useReports";
import dynamic from "next/dynamic";
import Image from "next/image"; // Use next/image

const ReportMapOverview = dynamic(() => import("@/components/ReportMapOverview"), {
  ssr: false,
  loading: () => <div className="h-[400px] sm:h-[500px] lg:h-[600px] w-full animate-pulse rounded-3xl bg-muted/40" />,
});

// Use configuration for remote images if domain is allowed in next.config.js
// If not, we have to use standard img or add domain. Assuming standard remote optimization is desired.
const HERO_REMOTE_BASE =
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80";

type HeroSlide =
  | {
    id: string;
    alt: string;
    kind: "remote";
    src: string;
  }
  | {
    id: string;
    alt: string;
    kind: "local";
    src: any; // StaticImageData
  };

const heroSlides: HeroSlide[] = [
  {
    id: "hero-dog-window",
    alt: "สุนัขหาบ้านนั่งริมหน้าต่างรอเจ้าของใหม่-Petskub",
    kind: "remote",
    src: HERO_REMOTE_BASE,
  },
  {
    id: "hero-cozy-cat",
    alt: "แมวหาบ้านน่ารักรอรับเลี้ยง-Petskub",
    kind: "local",
    src: heroImageCozyPicture,
  },
];

const Home = () => {
  const { data: cats } = useCats();
  const { data: reports } = useReports();
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const mapButtonClass = "bg-gradient-sunrise text-white shadow-soft hover:shadow-hover border-0";

  const urgentCats = cats?.filter(cat => cat.is_urgent && !cat.is_adopted).slice(0, 3) || [];
  const totalAdopted = cats?.filter(cat => cat.is_adopted).length || 0;
  const totalAvailable = cats?.filter(cat => !cat.is_adopted).length || 0;
  const totalReports = reports?.length || 0;
  const reportsWithCoordinates = useMemo(
    () => (reports ?? []).filter((report) => typeof report.latitude === "number" && typeof report.longitude === "number"),
    [reports]
  );

  const statCards = [
    {
      label: "สัตว์ได้บ้านแล้ว",
      value: totalAdopted,
      icon: FaHeart,
      accent: "from-blush/60 via-white/90 to-surface-sand",
      iconBg: "bg-blush/20 text-blush",
      valueColor: "text-blush",
    },
    {
      label: "สัตว์รอรับเลี้ยง",
      value: totalAvailable,
      icon: FaCat,
      accent: "from-sunrise/50 via-white/90 to-surface-warm",
      iconBg: "bg-sunrise/20 text-sunrise",
      valueColor: "text-sunrise",
    },
    {
      label: "จุดสัตว์จร",
      value: totalReports,
      icon: FaMapMarkerAlt,
      accent: "from-mint/40 via-surface-mint to-white",
      iconBg: "bg-mint/20 text-mint",
      valueColor: "text-mint",
    },
    {
      label: "กรณีด่วน",
      value: urgentCats.length,
      icon: FaExclamationTriangle,
      accent: "from-lilac/50 via-white/90 to-surface-lilac",
      iconBg: "bg-lilac/25 text-lilac",
      valueColor: "text-lilac",
    },
  ];

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const heroChips = [
    {
      label: "บ้านใหม่ที่สร้างได้",
      value: `${totalAdopted}+`,
      icon: FaHeart,
      className: "top-8 -left-6 animate-float-slow",
      background: "from-blush/70 to-white/80",
      iconBg: "bg-blush/20 text-blush",
    },
    {
      label: "จุดพบสัตว์จร",
      value: totalReports,
      icon: FaMapMarkerAlt,
      className: "-bottom-4 left-10 animate-float-delayed",
      background: "from-mint/70 to-white/80",
      iconBg: "bg-mint/20 text-mint",
    },
    {
      label: "เคสเร่งด่วน",
      value: urgentCats.length,
      icon: FaExclamationTriangle,
      className: "top-4 -right-4 animate-float-delayed",
      background: "from-coral/70 to-white/80",
      iconBg: "bg-coral/20 text-coral",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-warm">
        <div className="absolute inset-0 bg-gradient-sunrise opacity-[0.08]"></div>
        <div className="pointer-events-none absolute -top-20 -right-16 hidden lg:block">
          <div className="h-64 w-64 rounded-full bg-gradient-mint opacity-40 blur-3xl animate-float-slow"></div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 hidden md:block w-1/2 opacity-60">
          <div className="h-96 w-full bg-gradient-lilac blur-3xl animate-shimmer-soft"></div>
        </div>
        <div className="pointer-events-none absolute inset-y-12 left-0 hidden lg:block w-1/3 opacity-50">
          <div className="h-full w-full bg-gradient-to-r from-white/60 via-white/20 to-transparent animate-shimmer-soft"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 py-12 sm:py-20 md:py-28">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 shadow-sm">
                <Heart className="h-4 w-4 fill-primary text-primary" />
                <span className="font-prompt text-sm font-medium text-primary">ชุมชนช่วยเหลือสัตว์จรจัดครบวงจร</span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.15] tracking-[0.04em] text-foreground">
                <span className="block">Petskub – พื้นที่สื่อกลาง</span>
                <span className="mt-3 block text-primary sm:mt-4">
                  หมาหาบ้าน แมวหาบ้าน
                  <span className="ml-2 text-lilac">🐾</span>
                </span>
              </h1>
              <p className="font-prompt text-base sm:text-lg leading-relaxed text-muted-foreground">
                ร่วมเป็นส่วนหนึ่งในการเปลี่ยนแปลงชีวิตเพื่อนร่วมโลก ค้นหา รับเลี้ยงสุนัข และ รับเลี้ยงแมว ที่กำลังรอความรัก หรือ ลงประกาศหาบ้านให้สัตว์เลี้ยง ของคุณได้ฟรี สะดวก และปลอดภัยที่นี่
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <Link href="/adopt" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-14 w-full gap-2 px-8 text-base font-prompt bg-primary text-primary-foreground shadow-soft border-0 transition-transform hover:scale-105 hover:bg-primary-hover"
                  >
                    <Heart className="h-5 w-5" />
                    ค้นหาสัตว์เลี้ยงใกล้คุณ
                  </Button>
                </Link>
                <Link href="/add-cat" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 w-full gap-2 px-8 text-base font-prompt border-mint/60 text-foreground bg-white/70 hover:bg-mint/20 transition-transform hover:scale-105"
                  >
                    <Plus className="h-5 w-5" />
                    ลงประกาศหาบ้าน
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-warm opacity-20 blur-2xl"></div>
              <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border-4 border-white/50 shadow-hover animate-float-slow">
                <div className="relative aspect-[4/3] w-full bg-muted">
                  {heroSlides.map((slide, index) => {
                    const isActive = index === activeHeroIndex;
                    const transitionClasses = `absolute inset-0 h-full w-full transition-opacity duration-[2000ms] ease-out ${isActive ? "opacity-100" : "opacity-0"
                      }`;
                    // Use priority for the first slide to improve LCP
                    const priority = index === 0;

                    return (
                      <div key={slide.id} className={transitionClasses}>
                        <Image
                          src={slide.src}
                          alt={slide.alt}
                          fill
                          sizes="(max-width: 640px) 95vw, (max-width: 1024px) 70vw, 560px"
                          priority={priority}
                          className="object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 z-10">
                  {heroSlides.map((_, index) => (
                    <span
                      key={`indicator-${index}`}
                      className={`h-2 w-8 rounded-full transition-all ${index === activeHeroIndex ? "bg-white" : "bg-white/40"
                        }`}
                    ></span>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-3xl border border-border bg-card px-8 py-6 shadow-card animate-float-delayed z-20">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-success/10 p-3">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="font-prompt text-2xl font-bold text-foreground">{totalAdopted}+</div>
                    <div className="font-prompt text-sm text-muted-foreground">สัตว์ได้บ้านแล้ว</div>
                  </div>
                </div>
              </div>

              {heroChips.map((chip) => {
                const Icon = chip.icon;
                return (
                  <div
                    key={chip.label}
                    className={`absolute hidden lg:flex items-center gap-3 rounded-2xl border border-white/40 bg-gradient-to-r ${chip.background} px-5 py-3 shadow-soft backdrop-blur-lg ${chip.className} z-20`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${chip.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-prompt text-sm font-semibold text-foreground">{chip.label}</p>
                      <p className="font-prompt text-lg font-semibold text-foreground">{chip.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 bg-surface-cool">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {statCards.map(({ label, value, icon: Icon, accent, iconBg, valueColor }) => (
              <Card
                key={label}
                className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-4 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-hover"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-80`}></div>
                <div className="relative flex flex-col items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full shadow-inner ${iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className={`text-2xl sm:text-3xl font-bold font-prompt ${valueColor}`}>{value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-prompt">{label}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Petskub Section */}
      <section className="py-8 sm:py-16 bg-surface-warm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4 font-prompt">ทำไมต้องใช้ Petskub? 💡</h2>
            <p className="text-xs sm:text-base text-muted-foreground font-prompt max-w-2xl mx-auto">
              แพลตฟอร์มสื่อกลางที่ช่วยเชื่อมโยงผู้ให้และผู้รับเลี้ยงสัตว์ ครบวงจรและใช้งานง่าย
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/60 bg-white/90 p-4 sm:p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-hover">
              <div className="absolute inset-0 bg-gradient-to-br from-sunrise/20 via-white/90 to-surface-warm opacity-80"></div>
              <div className="relative">
                <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-sunrise/20 text-sunrise mb-2 sm:mb-4">
                  <Heart className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-base sm:text-xl font-bold mb-1.5 sm:mb-3 font-prompt">ค้นหาบ้านใหม่ได้ง่ายๆ</h3>
                <p className="text-muted-foreground font-prompt text-xs sm:text-sm leading-relaxed">
                  แหล่งรวมหมาหาบ้านและแมวหาบ้านจากทั่วประเทศ มีระบบกรองค้นหาตามจังหวัด สายพันธุ์ และความเร่งด่วน ช่วยให้คุณพบสัตว์เลี้ยงที่ใช่ได้รวดเร็ว
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/60 bg-white/90 p-4 sm:p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-hover">
              <div className="absolute inset-0 bg-gradient-to-br from-mint/20 via-white/90 to-surface-mint opacity-80"></div>
              <div className="relative">
                <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-mint/20 text-mint mb-2 sm:mb-4">
                  <Plus className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-base sm:text-xl font-bold mb-1.5 sm:mb-3 font-prompt">ลงประกาศฟรี ไม่มีค่าใช้จ่าย</h3>
                <p className="text-muted-foreground font-prompt text-xs sm:text-sm leading-relaxed">
                  หากคุณพบเจอสัตว์จรจัด หรือต้องการหาบ้านให้ลูกสุนัขหรือลูกแมว สามารถลงประกาศหาบ้านได้ทันที ช่วยให้พวกเขาเจอเจ้าของใหม่ได้ไวขึ้น
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/60 bg-white/90 p-4 sm:p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-hover">
              <div className="absolute inset-0 bg-gradient-to-br from-lilac/20 via-white/90 to-surface-lilac opacity-80"></div>
              <div className="relative">
                <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-lilac/20 text-lilac mb-2 sm:mb-4">
                  <MapPin className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-base sm:text-xl font-bold mb-1.5 sm:mb-3 font-prompt">แจ้งพิกัดสัตว์จรจัด</h3>
                <p className="text-muted-foreground font-prompt text-xs sm:text-sm leading-relaxed">
                  ระบบแจ้งเตือนจุดพบสัตว์จร เพื่อระดมความช่วยเหลือจากอาสาสมัครในพื้นที่ ไม่ว่าจะเป็นการหาบ้าน การรักษา หรือการทำหมัน
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Urgent Adoption Section */}
      <section className="py-16 bg-surface-sand">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 text-center sm:text-left sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 font-prompt">รวมประกาศสุนัขหาบ้าน และ แมวหาบ้าน ด่วน 🆘</h2>
              <p className="text-muted-foreground font-prompt">น้องหมาน้องแมวกำลังรอความรัก พบกับลูกสุนัขและลูกแมวที่ต้องการโอกาสที่สอง เลือกรับเลี้ยงที่ถูกชะตากับคุณวันนี้</p>
            </div>
            <Link href="/adopt" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full font-prompt gap-2">
                ดูทั้งหมด
                <TrendingUp className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {urgentCats && urgentCats.length > 0 ? (
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {urgentCats.map((cat) => (
                <CatCard
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  age={cat.age}
                  province={cat.province}
                  district={cat.district}
                  images={cat.image_url}
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
                  createdAt={cat.created_at}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/80 rounded-2xl p-8 shadow-card">
              <p className="text-lg text-muted-foreground font-prompt mb-4">
                🐾 ยังไม่มีกรณีด่วนในขณะนี้
              </p>
              <p className="text-sm text-muted-foreground font-prompt mb-6">
                ดูสัตว์ทั้งหมดที่รอรับเลี้ยงได้ในหน้าหาบ้านให้สัตว์เลี้ยง
              </p>
              <Link href="/adopt">
                <Button className="font-prompt">ดูสัตว์ทั้งหมด</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="py-16 bg-surface-lilac">
        <div className="container-fluid max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 font-prompt">แจ้งพิกัดสัตว์จรจัด 🗺️</h2>
            <p className="text-muted-foreground font-prompt">ระบบแจ้งเตือนจุดพบสัตว์จร เพื่อระดมความช่วยเหลือจากอาสาสมัครในพื้นที่ ไม่ว่าจะเป็นการหาบ้าน การรักษา หรือการทำหมัน</p>
          </div>

          <Card className="overflow-hidden shadow-soft p-6 bg-white/85 border border-white/60">
            {reportsWithCoordinates.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-4 text-center sm:text-left sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-left w-full">
                    <p className="text-sm text-muted-foreground font-prompt">อัปเดตจาก {reportsWithCoordinates.length} พิกัดล่าสุด</p>
                    <h3 className="text-2xl font-bold font-prompt">ภาพรวมจุดสัตว์จรทั่วประเทศ</h3>
                  </div>
                  <Button asChild className={`w-full sm:w-auto gap-2 font-prompt ${mapButtonClass}`}>
                    <Link href="/reports/map">
                      <MapPin className="w-4 h-4" />
                      ดูแผนที่เต็ม
                    </Link>
                  </Button>
                </div>
                <ReportMapOverview reports={reports} heightClass="h-[400px] sm:h-[500px] lg:h-[600px]" />
              </div>
            ) : (
              <div className="bg-surface-mint h-80 flex flex-col items-center justify-center gap-4 rounded-3xl">
                <MapPin className="w-16 h-16 text-primary" />
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 font-prompt">ยังไม่มีพิกัดให้แสดง</h3>
                  <p className="text-muted-foreground mb-4 font-prompt">เริ่มแจ้งจุดพบสัตว์จรเพื่อดูแผนที่ภาพรวม</p>
                  <Link href="/report">
                    <Button className="font-prompt">แจ้งจุดพบสัตว์จร</Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-warm text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-prompt">ทำไมต้องใช้ Petskub?</h2>
          <p className="text-lg mb-8 opacity-90 font-prompt">
            ค้นหาบ้านใหม่ได้ง่ายๆ แหล่งรวมหมาหาบ้านและแมวหาบ้านจากทั่วประเทศ ลงประกาศฟรี ไม่มีค่าใช้จ่าย ช่วยให้สัตว์เลี้ยงของคุณเจอเจ้าของใหม่ได้ไวขึ้น
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/adopt">
              <Button size="lg" variant="secondary" className="font-prompt gap-2">
                <Heart className="w-5 h-5" />
                ค้นหารับเลี้ยงสุนัข รับเลี้ยงแมว
              </Button>
            </Link>
            <Link href="/add-cat">
              <Button
                size="lg"
                variant="outline"
                className="border-white/80 bg-transparent text-white hover:bg-white/20 hover:text-white font-prompt gap-2"
              >
                <Plus className="w-5 h-5" />
                ลงประกาศหาบ้านให้ลูกสุนัข/ลูกแมว
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
