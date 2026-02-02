"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Plus, PenSquare, Trash2 } from "lucide-react";
import { useArticles, useDeleteArticle } from "@/shared/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { alert } from "@/lib/alerts";

const KnowledgePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { data: articles, isLoading } = useArticles();
  const deleteArticle = useDeleteArticle();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");

  const categories = ["ทั้งหมด", "การดูแล", "สุขภาพ", "รับเลี้ยง", "โภชนาการ", "พฤติกรรม"];

  const filteredArticles = articles?.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ทั้งหมด" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryCount = (category: string) => {
    if (!articles) return 0;
    if (category === "ทั้งหมด") return articles.length;
    return articles.filter((article) => article.category === category).length;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 font-prompt">ความรู้ก่อนรับเลี้ยงสุนัข รับเลี้ยงแมว 📚</h1>
            <p className="text-muted-foreground font-prompt max-w-2xl">
              บทความและคู่มือการดูแลแมวและสุนัขอย่างถูกวิธี การตัดสินใจรับเลี้ยงสัตว์สักหนึ่งตัว คือการรับผิดชอบหนึ่งชีวิตตลอดไป เรียนรู้ก่อนตัดสินใจ
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => router.push("/knowledge/create")}
              className="font-prompt gap-2"
            >
              <Plus className="w-4 h-4" />
              สร้างบทความ
            </Button>
          )}
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ค้นหาบทความ..."
              className="pl-12 h-12 font-prompt"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="font-prompt whitespace-nowrap"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} <span className="ml-2 opacity-70">{getCategoryCount(cat)}</span>
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-prompt">กำลังโหลด...</p>
          </div>
        ) : filteredArticles && filteredArticles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="rounded-[28px] border border-white/70 bg-white/95 shadow-card hover:shadow-hover transition-all">
                <div className="p-5 pb-0">
                  {article.image_url ? (
                    <div className="media-frame h-[190px] sm:h-[210px]">
                      <img
                        src={article.image_url}
                        alt={`${article.title}-บทความความรู้รับเลี้ยงสัตว์-Petskub`}
                        loading="lazy"
                        width={640}
                        height={420}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="media-frame h-[190px] sm:h-[210px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <BookOpen className="w-8 h-8" />
                      <p className="text-xs font-prompt">ยังไม่มีภาพหน้าปก</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <Badge variant="secondary" className="font-prompt">
                      {article.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 font-prompt line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-prompt">
                    {article.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground font-prompt">
                      👁️ {article.views} ครั้ง
                    </span>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="font-prompt gap-1"
                        >
                          <Link href={`/knowledge/${article.id}/edit`}>
                            <PenSquare className="w-4 h-4" /> แก้ไข
                          </Link>
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="font-prompt gap-1 bg-red-100 text-red-600 hover:bg-red-200 border border-red-200"
                          onClick={async () => {
                            const result = await alert.confirm("คุณแน่ใจหรือไม่?", {
                              description: "บทความที่ถูกลบจะไม่สามารถกู้คืนได้",
                              confirmText: "ลบบทความ",
                              cancelText: "ยกเลิก",
                            });

                            if (result.isConfirmed) {
                              try {
                                await deleteArticle.mutateAsync(article.id);
                                alert.success("ลบบทความเรียบร้อยแล้ว");
                              } catch (error) {
                                console.error(error);
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                        className="font-prompt bg-sunrise/10 text-sunrise border border-sunrise/20 hover:bg-sunrise/20"
                      >
                        <Link href={`/knowledge/${article.slug || article.id}`}>อ่านต่อ →</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-prompt">ไม่พบบทความที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}

        <Card className="mt-12 p-8 bg-gradient-soft text-center">
          <h2 className="text-2xl font-bold mb-4 font-prompt">
            มีคำถามเกี่ยวกับการดูแลแมวหรือสุนัข?
          </h2>
          <p className="text-muted-foreground mb-6 font-prompt">
            ติดต่อทีมงานหรือเข้าร่วมกลุ่มชุมชนเพื่อสอบถามและแลกเปลี่ยนประสบการณ์
          </p>
          <Button size="lg" className="font-prompt">
            เข้าร่วมชุมชน
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgePage;
