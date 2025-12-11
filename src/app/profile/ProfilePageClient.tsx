"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { THAI_PROVINCES } from "@/constants/thaiProvinces";
import { Loader2, Camera, Home, Upload, User as UserIcon } from "lucide-react";
import { alert } from "@/lib/alerts";

const ProfilePageClient = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { profile, isLoading: profileLoading, updateProfile, uploadAvatar } = useProfile();

    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        line_id: "",
        province: "",
        district: "",
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (profile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                full_name: profile.full_name || "",
                phone: profile.phone || "",
                line_id: profile.line_id || "",
                province: profile.province || "",
                district: profile.district || "",
            });
            setPreviewUrl(profile.avatar_url || null);
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProvinceChange = (value: string) => {
        setFormData((prev) => ({ ...prev, province: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert.error("ขนาดไฟล์เกินกำหนด", { description: "กรุณาอัปโหลดรูปภาพขนาดไม่เกิน 5MB" });
                return;
            }
            setAvatarFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            if (avatarFile) {
                await uploadAvatar.mutateAsync(avatarFile);
            }

            await updateProfile.mutateAsync(formData);

            // The updateProfile onSuccess handles the success alert, but we can add router logic here if needed
            // Currently just refreshing to ensure state is clean
        } catch (error) {
            console.error("Profile update failed:", error);
            // Alerts are handled in hooks
        }
    };

    if (authLoading || profileLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null; // Logic moved to useEffect

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12 pt-24 font-prompt">
            <div className="container mx-auto max-w-2xl px-4">
                <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.push('/')} className="gap-2 text-muted-foreground hover:text-primary">
                        <Home className="h-4 w-4" />
                        กลับหน้าหลัก
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลส่วนตัว</h1>
                </div>

                <Card className="border-none shadow-card">
                    <CardHeader className="bg-primary/5 pb-8 pt-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <Avatar className="h-32 w-32 border-4 border-white shadow-lg cursor-pointer transition-transform hover:scale-105" onClick={() => fileInputRef.current?.click()}>
                                    <AvatarImage src={previewUrl || undefined} className="object-cover" />
                                    <AvatarFallback className="bg-amber-100 text-amber-600 text-4xl">
                                        {formData.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                </Avatar>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full border border-white shadow-sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    type="button"
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold">{formData.full_name || "ไม่มีชื่อ"}</h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="full_name">ชื่อ - นามสกุล <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="เช่น สมชาย ใจดี"
                                        required
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="08x-xxx-xxxx"
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="line_id">Line ID</Label>
                                    <Input
                                        id="line_id"
                                        name="line_id"
                                        value={formData.line_id}
                                        onChange={handleChange}
                                        placeholder="ไอดีไลน์ของคุณ"
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="province">จังหวัด</Label>
                                    <Select value={formData.province} onValueChange={handleProvinceChange}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="เลือกจังหวัด" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-64">
                                            {THAI_PROVINCES.map((p) => (
                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="district">เขต / อำเภอ</Label>
                                    <Input
                                        id="district"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        placeholder="ระบุเขต/อำเภอ"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.back()}
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                                    disabled={updateProfile.isPending || uploadAvatar.isPending}
                                >
                                    {(updateProfile.isPending || uploadAvatar.isPending) ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        "บันทึกข้อมูล"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePageClient;
