"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePost } from "@/hooks/useForumPosts";
import { useAuth } from "@/hooks/useAuth";
import { alert } from "@/lib/alerts";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { MultiImageUpload } from "@/components/MultiImageUpload";

const categories = [
    { value: "general", label: "ทั่วไป" },
    { value: "adoption", label: "การรับเลี้ยง" },
    { value: "health", label: "สุขภาพ" },
    { value: "behavior", label: "พฤติกรรม" },
    { value: "nutrition", label: "อาหารและโภชนาการ" },
];

const CreateForumPostPage = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const createPost = useCreatePost();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);

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

        if (!title || !content || !category) {
            alert.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            await createPost.mutateAsync({
                title,
                content,
                category,
                user_id: user.id,
                image_urls: imageUrls,
            });

            // Redirect is handled by logic, but for safety:
            router.push("/forum");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-background py-8 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <Button
                    variant="ghost"
                    className="mb-6 font-prompt gap-2 text-muted-foreground hover:text-foreground pl-0"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4" />
                    ย้อนกลับ
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-prompt mb-2 text-foreground">ตั้งกระทู้ใหม่ 📝</h1>
                    <p className="text-muted-foreground font-prompt">สอบถาม พูดคุย หรือแบ่งปันเรื่องราวเกี่ยวกับสัตว์เลี้ยง</p>
                </div>

                <Card className="p-6 sm:p-8 shadow-card bg-white/90 backdrop-blur-sm border-white/60 rounded-3xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="font-prompt text-base font-semibold">หัวข้อกระทู้ <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="เช่น อยากทราบวิธีฝึกสุนัขให้ขับถ่ายเป็นที่..."
                                className="font-prompt h-12 text-lg rounded-xl bg-white/50 focus:bg-white transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="font-prompt text-base font-semibold">หมวดหมู่ <span className="text-red-500">*</span></Label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger className="font-prompt h-12 rounded-xl bg-white/50 focus:bg-white transition-all">
                                    <SelectValue placeholder="เลือกหมวดหมู่ที่ตรงกับเนื้อหา" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-white/60 shadow-lg">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value} className="font-prompt cursor-pointer">
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content" className="font-prompt text-base font-semibold">รายละเอียด <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="เขียนรายละเอียดเนื้อหาที่คุณต้องการสอบถามหรือแบ่งปัน..."
                                className="font-prompt min-h-[300px] text-base leading-relaxed p-4 rounded-xl bg-white/50 focus:bg-white transition-all resize-y"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="font-prompt text-base font-semibold">
                                รูปภาพประกอบ (สูงสุด 3 รูป)
                            </Label>
                            <MultiImageUpload
                                imageUrls={imageUrls}
                                onImagesChange={setImageUrls}
                                userId={user.id}
                                maxImages={3}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                            <Link href="/forum">
                                <Button variant="ghost" type="button" className="font-prompt h-12 px-6 rounded-full hover:bg-muted/50">
                                    ยกเลิก
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="font-prompt h-12 px-8 gap-2 bg-gradient-sunrise text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 rounded-full"
                                disabled={createPost.isPending}
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
            </div>
        </div>
    );
};

export default CreateForumPostPage;
