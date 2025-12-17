"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateArticle } from "@/shared/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { alert } from "@/lib/alerts";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from '@/integrations/supabase/client';

const CreateArticlePage = () => {
    const router = useRouter();
    const { user } = useAuth();
    // const isAdmin = useIsAdmin();
    const createArticle = useCreateArticle();

    const [title, setTitle] = useState("เริ่มต้นเลี้ยงสัตว์อย่างมืออาชีพ: คู่มือเตรียมตัวและเช็คลิสต์ที่ต้องรู้");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState(`# คู่มือมือใหม่: เตรียมตัวอย่างไรเมื่อคิดจะ "รับเลี้ยงสัตว์จร" 🐶🐱

![ภาพปก: ความสุขของการรับเลี้ยงสัตว์](/images/articles/adopt-cover.png)

การตัดสินใจ **รับเลี้ยงแมว** หรือ **รับเลี้ยงสุนัข** สักตัวเข้ามาเป็นสมาชิกใหม่ในบ้าน ถือเป็นเรื่องใหญ่ที่น่าตื่นเต้นและท้าทายสำหรับมือใหม่หลายๆ คน ความกังวลใจว่าเราจะดูแลเขาได้ดีไหม หรือต้องเตรียมตัวอย่างไรบ้าง เป็นเรื่องปกติที่เกิดขึ้นได้ครับ บทความนี้ PetsKub จะพามาดูเช็คลิสต์เตรียมความพร้อม เพื่อให้คุณมั่นใจและพร้อมสำหรับการเป็นเจ้าของสัตว์เลี้ยงที่ดีที่สุด

---

## 1. สำรวจความพร้อมของตัวเอง 📋
ก่อนที่จะเริ่มมองหา **รับเลี้ยงแมว** หรือ **รับเลี้ยงสุนัข** ลองถามตัวเองด้วยคำถามเหล่านี้ก่อนครับ:
*   **⏳ เวลา:** คุณมีเวลาให้เขามากแค่ไหน? ทั้งการให้อาหาร พาไปเดินเล่น (สำหรับสุนัข) และการเล่นด้วยกันเพื่อสร้างความผูกพัน
*   **🏠 สถานที่:** ที่พักอาศัยอนุญาตให้เลี้ยงสัตว์หรือไม่? มีพื้นที่เพียงพอไหม? โดยเฉพาะหากต้องการ **เลี้ยงแมวระบบปิด** ควรมีพื้นที่ที่ปลอดภัยและอากาศถ่ายเท
*   **👨‍👩‍👧‍👦 สมาชิกในบ้าน:** คนในครอบครัวเห็นด้วยหรือไม่? มีใครแพ้ขนสัตว์ไหม?
*   **💰 งบประมาณ:** นอกเหนือจากค่าอาหาร ยังมีค่าวัคซีน ค่ารักษาพยาบาลยามเจ็บป่วย และอุปกรณ์ต่างๆ ที่ต้องสำรองไว้

---

## 2. อุปกรณ์ที่ต้องเตรียม (Checklist สำหรับมือใหม่) 🛍️

![เช็คลิสต์อุปกรณ์เลี้ยงสัตว์](/images/articles/adopt-checklist.png)

เมื่อมั่นใจแล้ว มาดูกันว่า **อุปกรณ์เลี้ยงแมว มือใหม่** หรืออุปกรณ์สำหรับสุนัขที่จำเป็นต้องมีก่อนพาเข้าบ้านมีอะไรบ้าง:

### สำหรับแมว 🐱
*   [ ] **กระบะทรายและทรายแมว:** สำคัญมาก! ควรเลือกขนาดที่ใหญ่กว่าตัวแมวเล็กน้อย
*   [ ] **ชามอาหารและน้ำ:** แนะนำแบบเซรามิกหรือสแตนเลสเพื่อความสะอาด
*   [ ] **อาหารแมว:** เลือกสูตรที่เหมาะกับวัย (ลูกแมว/แมวโต) และมีคุณภาพดี
*   [ ] **ตะกร้าหรือกระเป๋าใส่แมว:** สำหรับพาไปหาหมอ
*   [ ] **ที่ลับเล็บแมว:** ช่วยลดความเครียดและป้องกันเฟอร์นิเจอร์เสียหาย
*   [ ] **ของเล่น:** ไม้ตกแมว ตุ๊กตา เพื่อความเพลิดเพลิน

### สำหรับสุนัข 🐶
*   [ ] **สายจูงและปลอกคอ:** พร้อมป้ายชื่อระบุเบอร์โทรเจ้าของ
*   [ ] **ชามอาหารและน้ำ:** ควรมีความทนทานและขนาดเหมาะสม
*   [ ] **อาหารสุนัข:** เลือกให้เหมาะกับขนาดสายพันธุ์และช่วงวัย
*   [ ] **เบาะนอน:** ให้เขามีพื้นที่ส่วนตัวที่อบอุ่น
*   [ ] **แผ่นรองซับ:** (สำหรับลูกสุนัขที่กำลังฝึกขับถ่าย)

## 3. การเตรียมตัวเลี้ยงแมวและการปรับตัว
สำหรับใครที่ตั้งใจจะ **เตรียมตัวเลี้ยงแมว** โดยเฉพาะการ **เลี้ยงแมวระบบปิด** (Keeping cats indoors) ซึ่งเป็นที่นิยมและปลอดภัยกว่าในปัจจุบัน
*   **ความปลอดภัย:** ติดตะแกรงมุ้งลวด หรือตาข่ายกั้นระเบียง เพื่อป้องกันแมวตกหรือหลุดหาย
*   **พื้นที่แนวตั้ง:** แมวชอบที่สูง ควรมีคอนโดแมวหรือเคลียร์พื้นที่หลังตู้ให้เขาได้ปีนป่าย
*   **การขับถ่าย:** วางกระบะทรายในที่เงียบสงบ และหมั่นตักทรายทิ้งทุกวัน

การพาแมวหรือสุนัขใหม่เข้าบ้านในช่วงแรก ควรให้เวลาเขาปรับตัว 2-3 วันในพื้นที่จำกัดก่อน แล้วค่อยๆ ปล่อยให้สำรวจบ้านเมื่อเขาเริ่มคุ้นเคยครับ

## 4. ค่าใช้จ่ายเบื้องต้นที่ควรทราบ
การ **รับเลี้ยงสัตว์จร** อาจไม่มีค่าตัว แต่มีค่าใช้จ่ายเริ่มต้นที่ควรเตรียมไว้ประมาณ 3,000 - 5,000 บาท ได้แก่:
*   ค่าตรวจสุขภาพและถ่ายพยาธิ
*   ค่าวัคซีนเข็มแรก (รวมพิษสุนัขบ้าและวัคซีนรวม)
*   ค่าอุปกรณ์พื้นฐาน (ตามเช็คลิสต์ด้านบน)
*   ค่าทำหมัน (หากอายุถึงเกณฑ์)

การรับเลี้ยงสัตว์จรจัด นอกจากจะได้เพื่อนซื่อสัตย์แล้ว ยังเป็นการให้โอกาสชีวิตใหม่และช่วยลดปัญหาสังคมด้วยครับ หากคุณพร้อมแล้ว อย่ารอช้า!

---

**พร้อมจะเป็นบ้านหลังสุดท้ายให้พวกเขาหรือยัง?**

[ดูน้องแมว/น้องหมาที่กำลังหาบ้าน คลิกเลย](https://www.petskub.com/adopt)`);
    const [category, setCategory] = useState("รับเลี้ยง");
    const [imageUrl, setImageUrl] = useState("/images/articles/adopt-cover.png");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            // Use the same path pattern as MultiImageUpload to avoid RLS issues
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert.error("กรุณาเข้าสู่ระบบก่อนสร้างบทความ");
            return;
        }

        if (!title || !content || !category || !slug) {
            alert.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            await createArticle.mutateAsync({
                title,
                slug,
                content,
                category,
                image_url: imageUrl || undefined,
                author_id: user.id,
                published: true,
            });

            alert.success("สร้างบทความเสร็จสิ้น");
            router.push("/knowledge");
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
                    <h1 className="text-3xl font-bold font-prompt mb-2">สร้างบทความใหม่ ✍️</h1>
                    <p className="text-muted-foreground font-prompt">แบ่งปันความรู้และประสบการณ์ให้กับชุมชน</p>
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
                                    if (!slug || slug === title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0E00-\u0E7F\-]+/g, '')) {
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
                            <Link href="/knowledge">
                                <Button variant="outline" type="button" className="font-prompt h-11 px-6">
                                    ยกเลิก
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="font-prompt h-11 px-8 gap-2 bg-gradient-sunrise text-white shadow-soft transition-transform hover:scale-105"
                                disabled={createArticle.isPending}
                            >
                                <Save className="w-5 h-5" />
                                {createArticle.isPending ? "กำลังบันทึก..." : "เผยแพร่บทความ"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default CreateArticlePage;
