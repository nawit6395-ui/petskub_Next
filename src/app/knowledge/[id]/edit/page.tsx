"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useArticle, useUpdateArticle } from "@/shared/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { alert } from "@/lib/alerts";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

const EditArticlePage = ({ params }: PageProps) => {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = useIsAdmin();
    const { data: article, isLoading } = useArticle(id);
    const updateArticle = useUpdateArticle();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        if (article) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTitle(article.title);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSlug(article.slug || "");
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setContent(article.content);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCategory(article.category);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImageUrl(article.image_url || "");
        }
    }, [article]);

    const categories = ["การดูแล", "สุขภาพ", "รับเลี้ยง", "โภชนาการ", "พฤติกรรม"];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background py-16 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen bg-background py-16 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                    <h2 className="text-xl font-bold font-prompt mb-4">ไม่มีสิทธิ์เข้าถึง</h2>
                    <p className="text-muted-foreground font-prompt mb-6">คุณไม่มีสิทธิ์ในการแก้ไขบทความ</p>
                    <Link href="/knowledge">
                        <Button className="font-prompt">กลับสู่หน้าความรู้</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !content || !category || !slug) {
            alert.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            if (!article) return;

            await updateArticle.mutateAsync({
                id: article.id,
                title,
                slug,
                content,
                category,
                image_url: imageUrl || undefined,
                updated_at: new Date().toISOString(),
            });

            alert.success("บันทึกการแก้ไขเสร็จสิ้น");
            router.push(`/knowledge/${id}`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Button
                    variant="ghost"
                    className="mb-6 font-prompt gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4" />
                    ย้อนกลับ
                </Button>

                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold font-prompt mb-2">แก้ไขบทความ 📝</h1>
                        <p className="text-muted-foreground font-prompt">แก้ไขข้อมูลบทความของคุณ</p>
                    </div>
                </div>

                <Card className="p-6 sm:p-8 shadow-card bg-white/90 backdrop-blur-sm border-white/60">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="font-prompt">หัวข้อบทความ *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (!slug) {
                                        setSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\u0E00-\u0E7F\-]+/g, ''));
                                    }
                                }}
                                placeholder="เช่น วิธีดูแลแมวเด็ก..."
                                className="font-prompt h-12 text-lg"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug" className="font-prompt">URL Slug (สำหรับ SEO) *</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-sm">https://petskub.com/knowledge/</span>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\u0E00-\u0E7F\-]+/g, ''))}
                                    placeholder="care-for-cats"
                                    className="font-prompt h-11"
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground font-prompt">
                                ชื่อลิงก์ภาษาอังกฤษหรือไทย (แนะนำภาษาอังกฤษ) ใช้ขีด (-) แทนวรรค
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="category" className="font-prompt">หมวดหมู่ *</Label>
                                <Select value={category} onValueChange={setCategory} required>
                                    <SelectTrigger className="font-prompt h-11">
                                        <SelectValue placeholder="เลือกหมวดหมู่" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat} className="font-prompt">
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imageUrl" className="font-prompt">รูปภาพหน้าปก (URL)</Label>
                                <Input
                                    id="imageUrl"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="font-prompt h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content" className="font-prompt">เนื้อหาบทความ *</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="เขียนเนื้อหาบทความที่นี่..."
                                className="font-prompt min-h-[400px] text-base leading-relaxed p-4"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Link href={`/knowledge/${id}`}>
                                <Button variant="outline" type="button" className="font-prompt h-11 px-6">
                                    ยกเลิก
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="font-prompt h-11 px-8 gap-2 bg-gradient-sunrise text-white shadow-soft transition-transform hover:scale-105"
                                disabled={updateArticle.isPending}
                            >
                                <Save className="w-5 h-5" />
                                {updateArticle.isPending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default EditArticlePage;
