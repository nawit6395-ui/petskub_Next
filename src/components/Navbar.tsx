"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image"; // Import Image
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LogIn, LogOut, Menu, MapPin, Sparkles, UserPlus, House, Search, Wand2, MapPinned, AlertTriangle, BookOpen, MessageCircle } from "lucide-react"; // Import new icons
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import Logo from "@/assets/Logo.png";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin();
  const { profile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileNavScrollRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path: string) => pathname === path;

  // Replaced FontAwesome icons with Lucide icons
  const navLinks = [
    { path: "/", icon: House, color: "#2E8BFD", label: "หน้าแรก" },
    { path: "/adopt", icon: Search, color: "#F472B6", label: "หาบ้านให้สัตว์เลี้ยง" },
    { path: "/success-stories", icon: Wand2, color: "#F59E0B", label: "เรื่องราวความสำเร็จ" },
    { path: "/report", icon: MapPinned, color: "#22C55E", label: "แจ้งเจอสัตว์จร" },
    { path: "/help", icon: AlertTriangle, color: "#EF4444", label: "ช่วยเหลือด่วน" },
    { path: "/knowledge", icon: BookOpen, color: "#A855F7", label: "ความรู้" },
    { path: "/forum", icon: MessageCircle, color: "#F97316", label: "เว็บบอร์ด" },
  ];

  const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace("#", "");
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const mobileNavItems = [...navLinks, ...navLinks];

  const adminLinks = isAdmin ? [{ path: "/admin", label: "Admin" }] : [];
  const quickAction = { path: "/report", label: "แจ้งสัตว์จรทันที" };


  useEffect(() => {
    // Mobile menu effect or other logic can go here if needed.
    // Auto-scroll logic removed.
  }, []);

  const getNavClasses = (path: string) =>
    cn(
      "group flex items-center gap-2 rounded-2xl px-3 py-2 text-base font-nav font-bold tracking-wide transition-all",
      isActive(path)
        ? "bg-white text-foreground shadow-sm border border-primary/10"
        : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
    );

  return (
    <nav className="sticky top-0 z-[2200] border-b border-border/70 bg-white shadow-sm md:bg-gradient-to-b md:from-white/95 md:to-white/80 md:backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 py-3">
          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-3xl border border-white/60 bg-white/80 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:flex md:flex-wrap md:justify-between">
            {/* Mobile Hamburger Menu */}
            <div className="md:hidden flex items-center">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-2xl border-2 border-primary/20 bg-primary text-primary-foreground shadow-[0_5px_15px_rgba(244,162,89,0.18)] transition hover:scale-105 hover:bg-primary-hover"
                    aria-label="เปิดเมนูนำทาง"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="border-none bg-transparent p-0">
                  <div className="fixed inset-y-0 left-0 flex h-dvh w-full max-w-sm flex-col overflow-hidden rounded-r-3xl bg-white shadow-[0_25px_60px_rgba(15,23,42,0.25)]">
                    <SheetHeader className="sr-only">
                      <SheetTitle>เมนูนำทาง</SheetTitle>
                      <SheetDescription>เลือกหมวดหมู่สำหรับการใช้งานบนมือถือ</SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 scrollbar-hide pb-24">
                      <div className="flex flex-col gap-2 mb-4">
                        {navLinks.map((link) => {
                          const Icon = link.icon;
                          const active = isActive(link.path);
                          return (
                            <Link key={link.path} href={link.path} onClick={() => setMobileMenuOpen(false)}>
                              <div
                                className={cn(
                                  "flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 active:scale-[0.98]",
                                  active
                                    ? "bg-primary/5 text-primary font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-primary/10"
                                    : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                              >
                                <span
                                  className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition-all shadow-sm"
                                  style={{
                                    backgroundColor: active ? link.color : hexToRgba(link.color, 0.12),
                                    color: active ? '#ffffff' : link.color
                                  }}
                                >
                                  <Icon className="w-5 h-5" aria-hidden="true" />
                                </span>
                                <span className={cn(
                                  "text-base font-medium",
                                  active ? "text-primary" : "text-slate-600"
                                )}>
                                  {link.label}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {adminLinks.length > 0 && (
                        <div className="border-t border-muted/40 pt-4 mt-2">
                          <p className="text-sm font-semibold text-muted-foreground mb-2 px-2">เมนูผู้ดูแลระบบ</p>
                          <div className="space-y-1">
                            {adminLinks.map((link) => (
                              <Link key={link.path} href={link.path} onClick={() => setMobileMenuOpen(false)}>
                                <Button
                                  variant={isActive(link.path) ? "secondary" : "ghost"}
                                  className="w-full justify-start text-base font-nav font-medium rounded-xl h-11"
                                >
                                  {link.label}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-4 pb-8 bg-gradient-to-t from-white via-white to-white/90 border-t border-slate-100/50 backdrop-blur-sm z-20">
                      <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 p-0.5 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all">
                        <Button
                          asChild
                          className="w-full h-12 rounded-xl bg-white hover:bg-white/90 text-primary font-bold border-none"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href={quickAction.path}>
                            <div className="flex items-center justify-center gap-2 text-lg">
                              <Sparkles className="h-5 w-5 text-orange-500" />
                              <span className="bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                                {quickAction.label}
                              </span>
                            </div>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link
              href="/"
              className="flex items-center justify-center gap-3 sm:gap-4 font-bold text-xl text-primary"
              aria-label="Petskub homepage"
            >
              <Image
                src={Logo}
                alt="Petskub logo"
                className="h-12 w-auto drop-shadow-[0_6px_18px_rgba(249,115,22,0.4)] sm:h-14 lg:h-16"
                loading="eager"
                priority
                sizes="(max-width: 640px) 48px, (max-width: 1024px) 56px, 64px"
              />
              <span className="font-prompt text-xl sm:text-2xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-transparent bg-clip-text hidden lg:inline">
                Petskub
              </span>
            </Link>

            <div className="hidden md:flex flex-1 flex-wrap items-center justify-center gap-2 px-3 min-w-0">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.path} href={link.path}>
                    <Button
                      variant="ghost"
                      className={getNavClasses(link.path)}
                      aria-current={isActive(link.path) ? "page" : undefined}
                    >
                      <span
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full"
                        style={{ backgroundColor: hexToRgba(link.color, 0.12), color: link.color, minWidth: "1rem" }}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              {adminLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <Button
                    variant="ghost"
                    className={getNavClasses(link.path)}
                    aria-current={isActive(link.path) ? "page" : undefined}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>

            <Button
              asChild
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 px-4 py-2 font-prompt text-white shadow-[0_10px_25px_rgba(234,88,12,0.4)] hover:scale-[1.02]"
            >
              <Link href={quickAction.path}>
                <MapPin className="h-4 w-4" />
                {quickAction.label}
              </Link>
            </Button>

            {user ? (
              <div className="flex items-center justify-end gap-2">
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="font-prompt gap-2 h-auto py-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline font-medium">
                      {profile?.full_name || user.email?.split("@")[0] || "ผู้ใช้"}
                    </span>
                    <span className="sr-only">โปรไฟล์ผู้ใช้ ({profile?.full_name || user.email?.split("@")[0] || "ผู้ใช้"})</span>
                  </Button>
                </Link>
                <Button
                  onClick={signOut}
                  size="sm"
                  className="font-prompt gap-1 sm:gap-2 rounded-full border-2 border-primary/20 bg-primary text-primary-foreground hover:bg-primary-hover shadow-[0_4px_12px_rgba(244,162,89,0.18)]"
                >
                  <LogOut className="w-4 h-4 text-white" />
                  <span className="sr-only sm:not-sr-only">ออกจากระบบ</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2">
                <Link href="/register">
                  <Button size="sm" className="font-prompt gap-1 sm:gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
                    <UserPlus className="w-4 h-4" />
                    <span className="sr-only sm:not-sr-only">สมัครสมาชิก</span>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="font-prompt gap-1 sm:gap-2">
                    <LogIn className="w-4 h-4" />
                    <span className="sr-only sm:not-sr-only">เข้าสู่ระบบ</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>


          <div className="md:hidden flex flex-col gap-2">
            <Button
              asChild
              className="w-full rounded-2xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 font-prompt text-white shadow-[0_10px_25px_rgba(234,88,12,0.4)]"
            >
              <Link href={quickAction.path}>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {quickAction.label}
                </div>
              </Link>
            </Button>
          </div>
        </div >
      </div >
    </nav >
  );
};

export default Navbar;
