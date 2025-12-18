"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useArticle, useUpdateArticle, useCheckSlugAvailability, useDeleteArticle } from "@/shared/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { alert } from "@/lib/alerts";
import { ArrowLeft, Save, Trash2, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";
import { supabase } from '@/integrations/supabase/client';
import RichTextEditor from '@/components/RichTextEditor';

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
    const checkSlug = useCheckSlugAvailability();
    const deleteArticle = useDeleteArticle();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [slugError, setSlugError] = useState("");
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        const checkSlugAvailability = async () => {
            if (!slug || !article) {
                setSlugError("");
                setIsCheckingSlug(false);
                return;
            }

            // Don't check if the slug hasn't changed from original
            if (slug === article.slug) {
                setSlugError("");
                setIsCheckingSlug(false);
                return;
            }

            setIsCheckingSlug(true);
            try {
                const isTaken = await checkSlug.mutateAsync({ slug, excludeId: article.id });
                if (isTaken) {
                    setSlugError("Slug นี้ถูกใช้ไปแล้ว กรุณาเปลี่ยนใหม่");
                } else {
                    setSlugError("");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsCheckingSlug(false);
            }
        };

        const timeoutId = setTimeout(checkSlugAvailability, 800);
        return () => clearTimeout(timeoutId);
    }, [slug, article]);

    const categories = ["การดูแล", "สุขภาพ", "รับเลี้ยง", "โภชนาการ", "พฤติกรรม"];

    // Image compression utility
    async function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
        if (!file.type.startsWith('image/')) return file;

        try {
            const imageBitmap = await createImageBitmap(file);
            let { width, height } = imageBitmap;

            const shouldResize = width > maxWidth || height > maxHeight;
            if (!shouldResize && file.size <= 2 * 1024 * 1024) { // If < 2MB and dimensions ok, skip
                return file;
            }

            const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return file;
            ctx.drawImage(imageBitmap, 0, 0, width, height);

            return await new Promise<File>((resolve) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return resolve(file);
                        const compressed = new File([blob], file.name, { type: blob.type });
                        resolve(compressed);
                    },
                    'image/jpeg',
                    quality
                );
            });
        } catch (e) {
            console.error("Compression failed:", e);
            return file;
        }
    }

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) {
            alert.error("กรุณาเข้าสู่ระบบก่อนอัพโหลดรูปภาพ");
            return;
        }

        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            // Compress
            const compressedFile = await compressImage(file);

            // Validate size (max 5MB after compression)
            if (compressedFile.size > 5 * 1024 * 1024) {
                alert.error("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)");
                return;
            }

            const fileExt = compressedFile.name.split('.').pop();
            // Use user ID based path to avoid RLS issues
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('cat-images') // Reusing existing bucket
                .upload(fileName, compressedFile);

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('cat-images')
                .getPublicUrl(data.path);

            setImageUrl(publicUrlData.publicUrl);
            alert.success("อัพโหลดรูปภาพเรียบร้อย");
        } catch (error: any) {
            console.error("Upload error:", error);
            alert.error("เกิดข้อผิดพลาดในการอัพโหลด", { description: error.message });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = () => {
        setImageUrl("");
    };

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

        if (slugError || isCheckingSlug) {
            alert.error(slugError || "กำลังตรวจสอบ Slug...");
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
                                <Label className="font-prompt">รูปภาพหน้าปก</Label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />

                                {imageUrl ? (
                                    <div className="relative rounded-lg overflow-hidden border aspect-video group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imageUrl}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="font-prompt text-xs"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                            >
                                                เปลี่ยนรูป
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="font-prompt text-xs"
                                                onClick={handleRemoveImage}
                                                disabled={uploading}
                                            >
                                                <X className="w-3 h-3 mr-1" /> ลบ
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="border-2 border-dashed rounded-lg h-[150px] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-2" />
                                                <span className="text-sm text-muted-foreground font-prompt">กำลังอัพโหลด...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                                <span className="text-sm text-muted-foreground font-prompt">คลิกเพื่ออัพโหลดรูปภาพ</span>
                                                <span className="text-xs text-muted-foreground/70 font-prompt mt-1">.jpg, .png (สูงสุด 5MB)</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content" className="font-prompt">เนื้อหาบทความ *</Label>
                            <RichTextEditor
                                content={content}
                                onChange={setContent}
                                onImageUpload={async (file) => {
                                    try {
                                        const compressedFile = await compressImage(file);
                                        if (compressedFile.size > 5 * 1024 * 1024) {
                                            alert.error("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)");
                                            throw new Error("File too large");
                                        }
                                        const fileExt = compressedFile.name.split('.').pop();
                                        const fileName = `${user?.id}/${Date.now()}_content.${fileExt}`;
                                        const { data, error } = await supabase.storage
                                            .from('cat-images')
                                            .upload(fileName, compressedFile);

                                        if (error) throw error;

                                        const { data: publicUrlData } = supabase.storage
                                            .from('cat-images')
                                            .getPublicUrl(data.path);

                                        return publicUrlData.publicUrl;
                                    } catch (error) {
                                        console.error("Editor upload error:", error);
                                        alert.error("อัพโหลดรูปภาพในเนื้อหาไม่สำเร็จ");
                                        throw error;
                                    }
                                }}
                                placeholder="เขียนเนื้อหาบทความที่นี่..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="destructive"
                                className="font-prompt h-11 px-6 gap-2 bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 mr-auto"
                                onClick={async () => {
                                    const result = await alert.confirm("คุณแน่ใจหรือไม่?", {
                                        description: "บทความที่ถูกลบจะไม่สามารถกู้คืนได้",
                                        confirmText: "ลบบทความ",
                                        cancelText: "ยกเลิก",
                                    });

                                    if (result.isConfirmed) {
                                        try {
                                            if (!article) return;
                                            await deleteArticle.mutateAsync(article.id);
                                            alert.success("ลบบทความเรียบร้อยแล้ว");
                                            router.push("/knowledge");
                                        } catch (error) {
                                            console.error(error);
                                        }
                                    }
                                }}
                            >
                                <Trash2 className="w-5 h-5" />
                                ลบบทความ
                            </Button>
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
