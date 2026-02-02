"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePost } from "@/hooks/useForumPosts";
import { useAuth } from "@/hooks/useAuth";
import { alert } from "@/lib/alerts";
import { ArrowLeft, Send, Loader2, MessageSquarePlus, Tag, FileText, ImagePlus, Sparkles } from "lucide-react";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import RichTextEditor from "@/components/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";

const MAX_CONTENT_LENGTH = 2000;
const MAX_TITLE_LENGTH = 100;

const categories = [
    { value: "general", label: "ทั่วไป", icon: "💬", description: "พูดคุยทั่วไปเกี่ยวกับสัตว์เลี้ยง" },
    { value: "adoption", label: "การรับเลี้ยง", icon: "🏠", description: "สอบถามเรื่องการรับเลี้ยง" },
    { value: "health", label: "สุขภาพ", icon: "💊", description: "ปัญหาสุขภาพและการรักษา" },
    { value: "behavior", label: "พฤติกรรม", icon: "🐾", description: "พฤติกรรมและการฝึก" },
    { value: "nutrition", label: "อาหารและโภชนาการ", icon: "🍖", description: "เรื่องอาหารและโภชนาการ" },
];

const CreateForumPostPage = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const createPost = useCreatePost();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [slug, setSlug] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    // Helper to generate slug from title
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\u0E00-\u0E7Fa-z0-9-]/g, "") // Keep Thai chars
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") + "-" + Math.floor(Math.random() * 1000);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        // Auto-update slug only if it looks like it was auto-generated or empty
        // For simplicity in this iteration, we always update slug if user hasn't heavily customized it (checking matching naive logic is hard), 
        // OR we just simply update it. User requested "Auto" so real-time update is best.
        setSlug(generateSlug(newTitle));
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background py-16 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background py-16 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md shadow-card border-white/60 bg-white/90">
                    <h2 className="text-xl font-bold font-prompt mb-4 text-primary">กรุณาเข้าสู่ระบบ</h2>
                    <p className="text-muted-foreground font-prompt mb-6">คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถตั้งกระทู้ได้</p>
                    <Link href="/login">
                        <Button className="font-prompt bg-gradient-sunrise text-white shadow-md hover:shadow-lg transition-all rounded-full px-8">เข้าสู่ระบบ</Button>
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

        // Strip HTML tags for character count validation
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        if (textContent.length > MAX_CONTENT_LENGTH) {
            alert.error(`เนื้อหาเกินจำนวนที่กำหนด`, {
                description: `กรุณาลดเนื้อหาให้ไม่เกิน ${MAX_CONTENT_LENGTH.toLocaleString()} ตัวอักษร (ปัจจุบัน ${textContent.length.toLocaleString()} ตัวอักษร)`
            });
            return;
        }

        if (title.length > MAX_TITLE_LENGTH) {
            alert.error(`หัวข้อยาวเกินไป`, {
                description: `กรุณาลดหัวข้อให้ไม่เกิน ${MAX_TITLE_LENGTH} ตัวอักษร`
            });
            return;
        }

        try {
            await createPost.mutateAsync({
                title,
                content,
                category,
                user_id: user.id,
                image_urls: imageUrls,
                slug,
            });

            alert.success("โพสต์กระทู้สำเร็จ! 🎉");
            // Redirect to the new post
            router.push(`/forum/${slug}`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-background to-background py-6 sm:py-8 pb-20">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-4 sm:mb-6 font-prompt gap-2 text-muted-foreground hover:text-foreground pl-0 h-auto py-2"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">ย้อนกลับ</span>
                </Button>

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
                            <MessageSquarePlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-prompt text-slate-800">ตั้งกระทู้ใหม่</h1>
                            <p className="text-xs sm:text-sm text-muted-foreground font-prompt">สอบถาม พูดคุย หรือแบ่งปันเรื่องราวเกี่ยวกับสัตว์เลี้ยง</p>
                        </div>
                    </div>
                </div>

                <Card className="p-4 sm:p-6 md:p-8 shadow-xl bg-white/95 backdrop-blur-sm border-0 rounded-2xl sm:rounded-3xl">
                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="font-prompt text-sm sm:text-base font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-orange-500" />
                                หัวข้อกระทู้ 
                                <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="เช่น อยากทราบวิธีฝึกสุนัขให้ขับถ่ายเป็นที่..."
                                    maxLength={MAX_TITLE_LENGTH}
                                    className="font-prompt h-11 sm:h-12 text-base rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-300 focus:ring-orange-200 transition-all pr-16"
                                    required
                                />
                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-prompt tabular-nums ${title.length > MAX_TITLE_LENGTH * 0.8 ? 'text-amber-500' : 'text-slate-400'}`}>
                                    {title.length}/{MAX_TITLE_LENGTH}
                                </span>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category" className="font-prompt text-sm sm:text-base font-semibold flex items-center gap-2">
                                <Tag className="w-4 h-4 text-orange-500" />
                                หมวดหมู่ 
                                <span className="text-red-500">*</span>
                            </Label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger className="font-prompt h-11 sm:h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-orange-300 focus:ring-orange-200 transition-all">
                                    <SelectValue placeholder="เลือกหมวดหมู่ที่ตรงกับเนื้อหา" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-0 shadow-xl">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value} className="font-prompt cursor-pointer py-3 focus:bg-orange-50">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{cat.icon}</span>
                                                <div>
                                                    <span className="font-medium">{cat.label}</span>
                                                    <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{cat.description}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <Label htmlFor="content" className="font-prompt text-sm sm:text-base font-semibold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-orange-500" />
                                รายละเอียด 
                                <span className="text-red-500">*</span>
                                <span className="text-xs font-normal text-muted-foreground ml-1">(สูงสุด {MAX_CONTENT_LENGTH.toLocaleString()} ตัวอักษร)</span>
                            </Label>
                            <RichTextEditor
                                content={content}
                                onChange={setContent}
                                maxLength={MAX_CONTENT_LENGTH}
                                showCharCount={true}
                                onImageUpload={async (file: File) => {
                                    try {
                                        if (file.size > 5 * 1024 * 1024) {
                                            alert.error("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)");
                                            throw new Error("File too large");
                                        }
                                        const fileExt = file.name.split('.').pop();
                                        const fileName = `${user?.id}/forum/${Date.now()}.${fileExt}`;
                                        const { data, error } = await supabase.storage
                                            .from('cat-images')
                                            .upload(fileName, file);

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
                                placeholder="เขียนรายละเอียดเนื้อหาที่คุณต้องการสอบถามหรือแบ่งปัน... ใช้เครื่องมือด้านบนเพื่อจัดรูปแบบข้อความ"
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-3">
                            <Label className="font-prompt text-sm sm:text-base font-semibold flex items-center gap-2">
                                <ImagePlus className="w-4 h-4 text-orange-500" />
                                รูปภาพประกอบ 
                                <span className="text-xs font-normal text-muted-foreground">(ไม่บังคับ, สูงสุด 3 รูป)</span>
                            </Label>
                            <MultiImageUpload
                                imageUrls={imageUrls}
                                onImagesChange={setImageUrls}
                                userId={user.id}
                                maxImages={3}
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-slate-100 mt-6 sm:mt-8">
                            <Link href="/forum" className="w-full sm:w-auto">
                                <Button variant="ghost" type="button" className="w-full sm:w-auto font-prompt h-11 sm:h-12 px-6 rounded-full hover:bg-slate-100 text-slate-600">
                                    ยกเลิก
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto font-prompt h-11 sm:h-12 px-8 gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200/50 transition-all hover:shadow-xl hover:shadow-orange-200/60 hover:brightness-105 rounded-full disabled:opacity-50"
                                disabled={createPost.isPending || !title || !content || !category}
                            >
                                {createPost.isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        กำลังโพสต์...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        โพสต์กระทู้
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Tips Card */}
                <Card className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 rounded-2xl">
                    <h3 className="font-prompt font-semibold text-sm sm:text-base text-blue-700 mb-2 flex items-center gap-2">
                        💡 เคล็ดลับการตั้งกระทู้ที่ดี
                    </h3>
                    <ul className="text-xs sm:text-sm text-blue-600/80 font-prompt space-y-1.5">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>ตั้งหัวข้อให้ชัดเจนและตรงประเด็น</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>ระบุรายละเอียดให้ครบถ้วน เช่น อายุ สายพันธุ์ อาการ</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>แนบรูปภาพประกอบจะช่วยให้เข้าใจปัญหาได้ดีขึ้น</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>เลือกหมวดหมู่ที่ตรงกับเนื้อหาเพื่อให้เข้าถึงกลุ่มเป้าหมาย</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default CreateForumPostPage;
