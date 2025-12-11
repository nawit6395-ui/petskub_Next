
"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PawPrint, PhoneCall } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForumPost, useUpdatePost } from "@/hooks/useForumPosts";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { alert } from "@/lib/alerts";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

const categories = [
    { value: "general", label: "ทั่วไป" },
    { value: "adoption", label: "การรับเลี้ยง" },
    { value: "health", label: "สุขภาพ" },
    { value: "behavior", label: "พฤติกรรม" },
    { value: "nutrition", label: "อาหารและโภชนาการ" },
];

const EditForumPostPage = ({ params }: PageProps) => {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = useIsAdmin();
    const { data: post, isLoading } = useForumPost(id, { skipViewIncrement: true });
    const updatePost = useUpdatePost();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    useEffect(() => {
        if (post) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTitle(post.title);
            setContent(post.content);
            setCategory(post.category);
            setImageUrls(post.image_urls || []);
        }
    }, [post]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background py-16 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const canEdit = user && post && (user.id === post.user_id || isAdmin);

    if (!canEdit) {
        return (
            <div className="min-h-screen bg-background py-16 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                    <h2 className="text-xl font-bold font-prompt mb-4">ไม่มีสิทธิ์เข้าถึง</h2>
                    <p className="text-muted-foreground font-prompt mb-6">คุณไม่มีสิทธิ์ในการแก้ไขกระทู้นี้</p>
                    <Link href={`/forum/${id}`}>
                        <Button className="font-prompt">กลับสู่กระทู้</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const handleAddImage = () => {
        if (currentImageUrl && !imageUrls.includes(currentImageUrl)) {
            setImageUrls([...imageUrls, currentImageUrl]);
            setCurrentImageUrl("");
        }
    };

    const handleRemoveImage = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !content || !category) {
            alert.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            await updatePost.mutateAsync({
                id,
                title,
                content,
                category,
                image_urls: imageUrls,
            });

            // Redirect handled by hook onSuccess if needed, but doing it here ensures smooth UX
            router.push(`/forum/${id}`);
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

                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-prompt mb-2">แก้ไขกระทู้ ✏️</h1>
                    <p className="text-muted-foreground font-prompt">แก้ไขข้อมูลกระทู้ของคุณ</p>
                </div>

                <Card className="p-6 sm:p-8 shadow-card bg-white/90 backdrop-blur-sm border-white/60">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="font-prompt">หัวข้อกระทู้ *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="ระบุหัวข้อกระทู้..."
                                className="font-prompt h-12 text-lg"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="font-prompt">หมวดหมู่ *</Label>
                            <Select value={category} onValueChange={setCategory} required>
                                <SelectTrigger className="font-prompt h-11">
                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value} className="font-prompt">
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content" className="font-prompt">รายละเอียด *</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="เขียนรายละเอียด..."
                                className="font-prompt min-h-[300px] text-base leading-relaxed p-4"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-prompt">รูปภาพประกอบ (URL)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={currentImageUrl}
                                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="font-prompt h-11"
                                />
                                <Button type="button" onClick={handleAddImage} variant="secondary" className="font-prompt h-11">
                                    เพิ่ม
                                </Button>
                            </div>

                            {imageUrls.length > 0 && (
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="relative group w-32 h-32 rounded-lg overflow-hidden border">
                                            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="sr-only">ลบ</span>
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Link href={`/forum/${id}`}>
                                <Button variant="outline" type="button" className="font-prompt h-11 px-6">
                                    ยกเลิก
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="font-prompt h-11 px-8 gap-2 bg-gradient-sunrise text-white shadow-soft transition-transform hover:scale-105"
                                disabled={updatePost.isPending}
                            >
                                <Save className="w-5 h-5" />
                                {updatePost.isPending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default EditForumPostPage;
