"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import {
  useForumPosts,
  useTogglePostReaction,
  useTrendingPosts,
} from "@/hooks/useForumPosts";
import { useAuth } from "@/hooks/useAuth";
import { alert } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pin, Lock } from "lucide-react";
import {
  FaComments,
  FaHandHoldingHeart,
  FaStethoscope,
  FaBrain,
  FaBowlFood,
  FaPen,
  FaFire,
  FaEye,
  FaMessage,
  FaHeart,
  FaPaw
} from "react-icons/fa6";

const categories = [
  { value: "all", label: "ทั้งหมด", icon: FaComments },
  { value: "general", label: "ทั่วไป", icon: FaPaw },
  { value: "adoption", label: "การรับเลี้ยง", icon: FaHandHoldingHeart },
  { value: "health", label: "สุขภาพ", icon: FaStethoscope },
  { value: "behavior", label: "พฤติกรรม", icon: FaBrain },
  { value: "nutrition", label: "อาหารและโภชนาการ", icon: FaBowlFood },
];

const ForumPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();
  const router = useRouter();
  const { data: posts, isLoading } = useForumPosts(selectedCategory, { userId: user?.id });
  const { data: trendingPosts } = useTrendingPosts(6, user?.id);
  const toggleReaction = useTogglePostReaction();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: "bg-sky-100/80 text-sky-600 hover:bg-sky-200 border-sky-200",
      adoption: "bg-emerald-100/80 text-emerald-600 hover:bg-emerald-200 border-emerald-200",
      health: "bg-rose-100/80 text-rose-600 hover:bg-rose-200 border-rose-200",
      behavior: "bg-purple-100/80 text-purple-600 hover:bg-purple-200 border-purple-200",
      nutrition: "bg-orange-100/80 text-orange-600 hover:bg-orange-200 border-orange-200",
    };
    return colors[category] || colors.general;
  };

  const getCategoryIconColor = (category: string) => {
    const colors: Record<string, string> = {
      general: "text-sky-500",
      adoption: "text-emerald-500",
      health: "text-rose-500",
      behavior: "text-purple-500",
      nutrition: "text-orange-500",
    };
    return colors[category] || "text-gray-400";
  };

  const handleToggleLike = (event: MouseEvent, postId: string, isLiked?: boolean) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      alert.error("กรุณาเข้าสู่ระบบเพื่อกดถูกใจ");
      router.push("/login");
      return;
    }

    toggleReaction.mutate({ postId, userId: user.id, isLiked: Boolean(isLiked) });
  };

  const renderImagePreview = (imageUrls?: string[]) => {
    if (!imageUrls || imageUrls.length === 0) return null;
    const preview = imageUrls.slice(0, 3);
    const remaining = imageUrls.length - preview.length;

    return (
      <div className="mt-4 -mx-1 flex gap-3 overflow-x-auto pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0 hide-scrollbar">
        {preview.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative h-[160px] w-[220px] flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-orange-50 shadow-sm transition-transform hover:rotate-1 hover:scale-[1.02]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`รูปประกอบกระทู้ฟอรั่มคนรักสัตว์ที่ ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {index === preview.length - 1 && remaining > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg font-bold text-white backdrop-blur-[2px]">
                +{remaining}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const selectedCategoryLabel = categories.find(c => c.value === selectedCategory)?.label;
  const SelectedCategoryIcon = categories.find(c => c.value === selectedCategory)?.icon || FaComments;

  return (
    <div className="min-h-screen bg-[#FFF9F5] pb-12 pt-8 selection:bg-orange-200 selection:text-orange-900">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white/60 p-6 rounded-[32px] border border-orange-100 backdrop-blur-sm">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-prompt text-gray-800 sm:text-4xl flex items-center gap-3">
              <span className="bg-gradient-to-br from-orange-400 to-rose-400 text-white p-3 rounded-2xl shadow-lg shadow-orange-200 rotate-3">
                <FaComments className="h-7 w-7" />
              </span>
              ฟอรั่มคนรักสัตว์ <span className="text-orange-500">PetsKub</span>
            </h1>
            <p className="text-base text-gray-500 font-prompt max-w-lg leading-relaxed pl-1">
              พื้นที่อบอุ่นสำหรับคนรักสัตว์ แลกเปลี่ยนความรู้เรื่องการรับเลี้ยงสุนัข รับเลี้ยงแมว สุขภาพสัตว์ และสอบถามข้อสงสัย
            </p>
          </div>

          {user && (
            <Link href="/forum/create">
              <Button size="lg" className="w-full sm:w-auto font-prompt bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white shadow-lg shadow-orange-200 rounded-full px-8 h-12 transition-all hover:scale-105 active:scale-95 border-2 border-white/20">
                <FaPen className="mr-2.5 h-4 w-4" />
                เริ่มสร้างกระทู้ใหม่
              </Button>
            </Link>
          )}
        </div>

        {/* Trending Section */}
        {trendingPosts && trendingPosts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5 px-2">
              <div className="p-2 bg-orange-100 text-orange-500 rounded-xl rotate-3">
                <FaFire className="h-5 w-5 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold font-prompt text-gray-800">กระทู้ยอดนิยม 🔥</h2>
            </div>

            <div className="relative">
              {/* Fade masks for scroll interaction hint */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FFF9F5] to-transparent z-10 pointer-events-none md:hidden" />
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FFF9F5] to-transparent z-10 pointer-events-none md:hidden" />

              <div className="flex gap-5 overflow-x-auto pb-6 pt-2 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {trendingPosts.map((post) => (
                  <Link key={post.id} href={`/forum/${post.slug || post.id}`} className="min-w-[280px] sm:min-w-[320px] snap-center">
                    <div className="group h-full rounded-[24px] border-2 border-white bg-white p-5 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-100 cursor-pointer relative overflow-hidden hover:border-orange-100">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/50 to-rose-100/50 rounded-bl-[40px] -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-700" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary" className={`font-prompt border border-transparent px-3 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                            {categories.find((c) => c.value === post.category)?.label || post.category}
                          </Badge>
                          <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 flex items-center gap-1">
                            <FaFire className="w-3 h-3 text-orange-500" /> {post.trend_score.toFixed(0)}
                          </span>
                        </div>

                        <h3 className="mb-3 line-clamp-2 font-bold font-prompt text-gray-800 text-lg group-hover:text-orange-500 transition-colors leading-snug min-h-[3.5rem]">
                          {post.title}
                        </h3>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center text-xs text-orange-600 font-bold border-2 border-white shadow-sm">
                              {post.profiles?.full_name?.charAt(0) || "U"}
                            </div>
                            <span className="text-xs font-semibold text-gray-500 truncate max-w-[100px]">
                              {post.profiles?.full_name || "ไม่ระบุชื่อ"}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1.5 rounded-full">
                            <span className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                              <FaHeart className={`h-3 w-3 ${post.is_liked ? "text-rose-500" : "text-rose-300"}`} />
                              {post.like_count}
                            </span>
                            <span className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                              <FaMessage className="h-3 w-3 text-sky-400" />
                              {post.comment_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories & Main Content */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-8">
          <div className="sticky top-[72px] z-30 py-3 bg-[#FFF9F5]/95 backdrop-blur-md -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none sm:static sm:py-0">
            <TabsList className="flex h-auto w-full justify-start overflow-x-auto gap-3 bg-transparent p-0 scrollbar-hide">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.value;
                const iconColorClass = getCategoryIconColor(cat.value);

                return (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className={`flex-shrink-0 rounded-full border-2 px-6 py-2.5 text-sm font-prompt font-bold gap-2 transition-all duration-300
                      ${isSelected
                        ? "border-orange-400 bg-orange-400 text-white shadow-lg shadow-orange-200"
                        : "border-white bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50"
                      }
                    `}
                  >
                    <Icon className={isSelected ? "text-white" : iconColorClass} />
                    {cat.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value={selectedCategory} className="mt-0 focus-visible:outline-none">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-orange-100">
              <div className={`p-3 rounded-2xl shadow-sm border border-orange-100 ${selectedCategory === 'all' ? 'bg-orange-100 text-orange-600' :
                  selectedCategory === 'health' ? 'bg-rose-100 text-rose-600' :
                    selectedCategory === 'adoption' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-white text-gray-600'
                }`}>
                <SelectedCategoryIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-prompt text-gray-800">
                  {selectedCategory === 'all' ? 'กระทู้ทั้งหมด' : selectedCategoryLabel}
                </h2>
                <p className="text-sm text-gray-400 font-prompt">
                  {posts?.length || 0} รายการที่พบ
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-24 text-center">
                <div className="mx-auto w-16 h-16 border-4 border-orange-100 border-t-orange-400 rounded-full animate-spin mb-4" />
                <p className="text-orange-400 font-prompt font-medium animate-pulse">กำลังโหลดเรื่องราวดีๆ...</p>
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-5">
                {posts.map((post) => (
                  <Link key={post.id} href={`/forum/${post.slug || post.id}`}>
                    <Card className="group border-2 border-white bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-orange-100/50 hover:border-orange-200 transition-all duration-300 overflow-hidden rounded-[24px]">
                      <CardHeader className="pb-3 md:pb-4 p-5 md:p-7">
                        <div className="flex flex-col md:flex-row gap-6">

                          {/* Vote / Stat Column */}
                          <div className="hidden md:flex flex-col items-center gap-1 min-w-[3.5rem] pt-1">
                            <button
                              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all border-2 ${post.is_liked
                                  ? "bg-rose-50 border-rose-100 text-rose-500 shadow-inner"
                                  : "bg-gray-50 border-transparent text-gray-300 hover:bg-white hover:border-orange-100 hover:text-rose-400 hover:shadow-md"
                                }`}
                              onClick={(e) => handleToggleLike(e, post.id, post.is_liked)}
                            >
                              <FaHeart className={`w-6 h-6 mb-1 transition-transform ${post.is_liked ? "fill-current scale-110" : "scale-100 text-rose-200 hover:text-rose-400"}`} />
                              <span className="text-xs font-bold">{post.like_count}</span>
                            </button>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge className={`font-prompt border border-transparent px-3 py-1 rounded-full ${getCategoryColor(post.category)}`}>
                                {categories.find((c) => c.value === post.category)?.label || post.category}
                              </Badge>
                              {post.is_pinned && (
                                <Badge variant="secondary" className="gap-1.5 bg-yellow-50 text-yellow-600 border-yellow-100 rounded-full px-3">
                                  <Pin className="h-3 w-3 fill-current text-yellow-500" />
                                  ปักหมุด
                                </Badge>
                              )}
                              {post.is_locked && (
                                <Badge variant="outline" className="gap-1 text-gray-400 border-gray-200 rounded-full px-3">
                                  <Lock className="h-3 w-3 text-gray-300" />
                                  ล็อค
                                </Badge>
                              )}
                              <span className="ml-auto text-xs text-gray-400 font-prompt bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                {formatDistanceToNow(new Date(post.created_at), {
                                  addSuffix: true,
                                  locale: th,
                                })}
                              </span>
                            </div>

                            <CardTitle className="text-xl md:text-2xl font-bold font-prompt text-gray-800 group-hover:text-orange-500 transition-colors mb-3 leading-relaxed">
                              {post.title}
                            </CardTitle>

                            <CardDescription className="font-prompt text-base text-gray-500 line-clamp-2 md:line-clamp-3 mb-5 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-transparent group-hover:bg-orange-50/30 group-hover:border-orange-50 transition-colors">
                              {post.content}
                            </CardDescription>

                            {renderImagePreview(post.image_urls)}

                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-dashed border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-200 to-rose-200 flex items-center justify-center text-xs text-white font-bold ring-2 ring-white shadow-sm">
                                  {post.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <span className="text-sm font-bold text-gray-600 font-prompt truncate max-w-[150px]">
                                  {post.profiles?.full_name || "ผู้ใช้ไม่ระบุชื่อ"}
                                </span>
                              </div>

                              {/* Mobile Stats */}
                              <div className="flex items-center gap-4 text-sm text-gray-400 font-medium md:hidden bg-gray-50 px-3 py-1 rounded-full">
                                <span className="flex items-center gap-1.5">
                                  <FaHeart className={`w-3.5 h-3.5 ${post.is_liked ? "text-rose-500" : "text-rose-300"}`} />
                                  {post.like_count}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <FaMessage className="w-3.5 h-3.5 text-sky-400" />
                                  {post.comment_count}
                                </span>
                              </div>

                              <div className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-medium">
                                <span className="flex items-center gap-2 hover:text-orange-500 transition-colors bg-white px-3 py-1 rounded-full border border-transparent hover:border-orange-100 hover:shadow-sm">
                                  <FaEye className="w-4 h-4 text-orange-300 group-hover:text-orange-400" />
                                  {post.views.toLocaleString()} <span className="text-xs">เข้าชม</span>
                                </span>
                                <span className="flex items-center gap-2 hover:text-blue-500 transition-colors bg-white px-3 py-1 rounded-full border border-transparent hover:border-blue-100 hover:shadow-sm">
                                  <FaMessage className="w-3.5 h-3.5 text-sky-300 group-hover:text-sky-400" />
                                  {post.comment_count} <span className="text-xs">ความคิดเห็น</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white/60 rounded-[32px] shadow-sm border border-orange-100 backdrop-blur-sm">
                <div className="mx-auto w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-orange-300 animate-bounce">
                  {selectedCategory === 'all' ? <FaComments className="w-10 h-10 text-orange-400" /> : <SelectedCategoryIcon className="w-10 h-10 text-orange-400" />}
                </div>
                <h3 className="text-xl font-bold font-prompt text-gray-800 mb-2">ยังไม่มีเรื่องราวในหมวดนี้</h3>
                <p className="text-gray-500 font-prompt mb-8 max-w-sm mx-auto">
                  มาร่วมแบ่งปันความน่ารัก หรือสอบถามเรื่องราวเกี่ยวกับสัตว์เลี้ยงกันเถอะ
                </p>
                {user ? (
                  <Link href="/forum/create">
                    <Button className="font-prompt bg-orange-400 hover:bg-orange-500 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all hover:-translate-y-1">
                      <FaPen className="mr-3 h-4 w-4" />
                      เริ่มเขียนกระทู้แรก
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" className="font-prompt rounded-full border-orange-200 text-orange-500 hover:bg-orange-50 px-8 py-6">
                      เข้าสู่ระบบเพื่อเริ่มใช้งาน
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!user && (
          <div className="mt-16 rounded-[40px] bg-gradient-to-br from-orange-400 via-rose-400 to-amber-400 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl shadow-orange-200">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl animate-pulse delay-700" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-block p-4 bg-white/20 rounded-3xl mb-6 backdrop-blur-md">
                <FaPaw className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold font-prompt text-white mb-4 shadow-sm">
                มาร่วมเป็นส่วนหนึ่งของครอบครัว PetsKub 🐾
              </h3>
              <p className="text-white/90 mb-10 font-prompt text-lg leading-relaxed max-w-2xl mx-auto">
                สังคมที่อบอุ่นสำหรับคนรักสัตว์ แลกเปลี่ยนความรู้ แชร์ความน่ารัก และช่วยเหลือซึ่งกันและกัน
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto font-prompt bg-white text-orange-500 hover:bg-orange-50 rounded-full h-14 px-10 text-lg font-bold shadow-xl border-4 border-white/30">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto font-prompt border-white text-white hover:bg-white/20 rounded-full h-14 px-10 text-lg font-bold bg-transparent">
                    สมัครสมาชิกฟรี
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;
