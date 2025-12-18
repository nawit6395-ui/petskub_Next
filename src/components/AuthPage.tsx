"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import {
    Mail,
    Lock,
    ArrowRight,
    ShieldCheck,
    Clock,
    User,
    Check
} from "lucide-react";

// Dynamically import Dialog components to reduce initial bundle size (Unused JS optimization)
const Dialog = dynamic(() => import("@/components/ui/dialog").then((mod) => mod.Dialog), { ssr: false });
const DialogContent = dynamic(() => import("@/components/ui/dialog").then((mod) => mod.DialogContent), { ssr: false });
const DialogDescription = dynamic(() => import("@/components/ui/dialog").then((mod) => mod.DialogDescription), { ssr: false });
const DialogFooter = dynamic(() => import("@/components/ui/dialog").then((mod) => mod.DialogFooter), { ssr: false });
const DialogHeader = dynamic(() => import("@/components/ui/dialog").then((mod) => mod.DialogHeader), { ssr: false });
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then((mod) => mod.DialogTitle), { ssr: false });

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { alert } from "@/lib/alerts";
import { buildAppUrl } from "@/lib/utils";
import Logo from "@/assets/Logo.png";
import PasswordInput from "@/components/PasswordInput";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
    email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

const signupSchema = loginSchema
    .extend({
        confirmPassword: z.string(),
        fullName: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "รหัสผ่านไม่ตรงกัน",
        path: ["confirmPassword"],
    });

function AuthPageContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const defaultModeIsLogin = !(pathname === "/register" || searchParams.get("mode") === "signup");
    const [isLogin, setIsLogin] = useState<boolean>(defaultModeIsLogin);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [participantsToday, setParticipantsToday] = useState<number | null>(null);
    const [isFetchingStats, setIsFetchingStats] = useState(true);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [isSendingReset, setIsSendingReset] = useState(false);

    const [signupSuccess, setSignupSuccess] = useState<string | null>(null);
    const { user, signIn, signUp, syncProfileFromUser } = useAuth();

    useEffect(() => {
        // If user is already logged in, redirect to home
        if (user) {
            router.replace("/");
        }
    }, [user, router]);

    useEffect(() => {
        const fetchParticipantsToday = async () => {
            try {
                const { data, error } = await supabase.rpc("get_daily_participant_count");
                if (error) throw error;
                setParticipantsToday(data ?? 0);
            } catch (error) {
                console.error("Failed to load login stats:", error);
                setParticipantsToday(0);
            } finally {
                setIsFetchingStats(false);
            }
        };

        fetchParticipantsToday();
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: buildAppUrl("/"),
                },
            });

            if (error) throw error;
            await syncProfileFromUser();
        } catch (error: any) {
            alert.error("ไม่สามารถเข้าสู่ระบบด้วย Google ได้", {
                description: error.message,
            });
        }
    };

    const handleFacebookSignIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "facebook",
                options: {
                    redirectTo: buildAppUrl("/"),
                },
            });

            if (error) throw error;
            await syncProfileFromUser();
        } catch (error: any) {
            alert.error("ไม่สามารถเข้าสู่ระบบด้วย Facebook ได้", {
                description: error.message,
            });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (isLogin) {
            setSignupSuccess(null);
            const result = loginSchema.safeParse({ email, password });
            if (!result.success) {
                const fieldErrors: Record<string, string> = {};
                (result.error as any).errors.forEach((err: any) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0].toString()] = err.message;
                    }
                });
                setErrors(fieldErrors);
                return;
            }
            try {
                await signIn(email, password);
            } catch (error) {
                console.error("Auth error:", error);
            }
            return;
        }

        setSignupSuccess(null);
        const result = signupSchema.safeParse({ email, password, confirmPassword, fullName });
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            (result.error as any).errors.forEach((err: any) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0].toString()] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        const sanitizedEmail = email.trim();
        try {
            const { error } = await signUp(sanitizedEmail, password, fullName || undefined);
            if (error) {
                setSignupSuccess(null);
                const loweredMessage = error.message?.toLowerCase?.() ?? "";
                if (
                    error.message === "EMAIL_ALREADY_REGISTERED" ||
                    loweredMessage.includes("already registered")
                ) {
                    setErrors({ email: "คุณเคยใช้อีเมลนี้สมัครแล้ว กรุณาเข้าสู่ระบบหรือใช้ฟีเจอร์ลืมรหัสผ่าน" });
                    setIsLogin(true);
                    return;
                }
                alert.error("สมัครสมาชิกไม่สำเร็จ", { description: error.message });
                return;
            }
            setSignupSuccess("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน");
            setIsLogin(true);
            setPassword("");
            setConfirmPassword("");
            setFullName("");
            setEmail("");
            setErrors({});
        } catch (error: any) {
            setSignupSuccess(null);
            alert.error("เกิดข้อผิดพลาดขณะสมัครสมาชิก", { description: error?.message || "Unknown error" });
        }
    };

    const handleForgotPasswordClick = () => {
        setIsResetDialogOpen(true);
        setResetEmail((prev) => (prev ? prev : email));
    };

    const handleSendPasswordReset = async () => {
        const emailToReset = resetEmail.trim() || email.trim();
        const validation = z.string().email("กรุณากรอกอีเมลให้ถูกต้อง").safeParse(emailToReset);
        if (!validation.success) {
            alert.error("ส่งอีเมลรีเซ็ตรหัสผ่านไม่สำเร็จ", { description: "กรุณากรอกอีเมลให้ถูกต้องก่อน" });
            return;
        }
        try {
            setIsSendingReset(true);
            const { error } = await supabase.auth.resetPasswordForEmail(validation.data, {
                redirectTo: buildAppUrl("/login"),
            });
            if (error) throw error;
            alert.success("ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว", { description: "โปรดตรวจสอบกล่องจดหมาย" });
            setIsResetDialogOpen(false);
            setResetEmail("");
        } catch (error: any) {
            alert.error("ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้", { description: error.message });
        } finally {
            setIsSendingReset(false);
        }
    };

    // Derived State for UI Theme
    const themeColor = isLogin ? "bg-[#FB923C]" : "bg-[#84CC16]"; // Orange-400 : Lime-500
    const themeGradient = isLogin
        ? "from-orange-300 to-orange-500"
        : "from-lime-400 to-lime-600";
    const buttonColor = isLogin
        ? "bg-[#FB923C] hover:bg-[#F97316]"
        : "bg-[#84CC16] hover:bg-[#65A30D]";

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FDF8F6] p-4 font-prompt">
            <div className="w-full max-w-[1100px] h-auto min-h-[600px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row">

                {/* Left Panel - Branding & Info */}
                <div className={cn(
                    "w-full md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-between transition-colors duration-500",
                    themeColor
                )}>
                    {/* Header Logo */}
                    <div>
                        <div className="inline-flex items-center gap-3 bg-white shadow-lg shadow-black/5 rounded-full px-5 py-2.5 mb-8">
                            <Image
                                src={Logo}
                                alt="Petskub Logo"
                                className="w-8 h-auto"
                                priority
                                sizes="(max-width: 768px) 32px, 32px"
                            />
                            <span className={cn(
                                "font-bold tracking-widest text-sm",
                                isLogin ? "text-[#FB923C]" : "text-[#84CC16]"
                            )}>PETSKUB</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                            {isLogin ? "ยินดีต้อนรับกลับสู่" : "ร่วมเป็นส่วนหนึ่งกับ"}
                            <br />
                            <span className="opacity-90">ชุมชนช่วยสัตว์จร</span>
                        </h1>
                        <p className="text-white/80 text-lg font-light leading-relaxed max-w-md">
                            รวมพลังรายงานเคสด่วน ช่วยให้น้อง ๆ ปลอดภัย สมัครง่าย เชื่อมต่อคนรักสัตว์ใกล้คุณ
                        </p>
                    </div>

                    {/* Features / Stats */}
                    <div className="space-y-4 my-8 md:my-0">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">ระบบยืนยันตัวตน</h3>
                                <p className="text-xs text-white/70">ปลอดภัยจากสแปม</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">สมัครและใช้งานฟรี</h3>
                                <p className="text-xs text-white/70">ใช้เวลาไม่ถึง 1 นาที</p>
                            </div>
                        </div>

                        {/* Daily Stats Request */}
                        <div className="flex items-center gap-3 mt-6 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                            <p className="text-sm font-medium">
                                วันนี้มีเพื่อน ๆ ใช้งานแล้ว <span className="font-bold text-lg">{(participantsToday ?? 0).toLocaleString()}</span> คน
                            </p>
                        </div>
                    </div>

                    {/* Footer Copyright */}
                    <div className="text-xs text-white/40">
                        &copy; {new Date().getFullYear()} Petskub. All rights reserved.
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
                    <div className="max-w-[400px] mx-auto w-full">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">
                            {isLogin ? "เข้าสู่ระบบ" : "สร้างบัญชีใหม่"}
                        </h2>
                        <p className="text-slate-500 mb-8">
                            {isLogin ? "กรอกข้อมูลเพื่อเข้าใช้งานบัญชีของคุณ" : "กรอกข้อมูลเพื่อเริ่มต้นช่วยเหลือสัตว์จร"}
                        </p>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl gap-2 hover:bg-slate-50 border-slate-200"
                                onClick={handleGoogleSignIn}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                </svg>
                                Google
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl gap-2 hover:bg-slate-50 border-slate-200"
                                onClick={handleFacebookSignIn}
                            >
                                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M22 12.07C22 6.55 17.52 2.07 12 2.07S2 6.55 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H7.9v-2.9h2.54V9.64c0-2.5 1.5-3.89 3.79-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.8 8.42-4.94 8.42-9.93z" />
                                </svg>
                                Facebook
                            </Button>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">หรือด้วยอีเมล</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {signupSuccess && (
                                <div className="p-3 bg-lime-50 text-lime-700 text-sm rounded-xl font-medium flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    {signupSuccess}
                                </div>
                            )}

                            {!isLogin && (
                                <div className="space-y-1">
                                    <Label className="text-slate-700">ชื่อผู้ใช้งาน</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="เช่น คนรักสัตว์ ใจดี"
                                            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label className="text-slate-700">อีเมล</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <Label className="text-slate-700">รหัสผ่าน</Label>
                                    {isLogin && (
                                        <button
                                            type="button"
                                            onClick={handleForgotPasswordClick}
                                            className="text-xs font-semibold text-[#FB923C] hover:underline"
                                        >
                                            ลืมรหัสผ่าน?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <PasswordInput
                                        placeholder="••••••••"
                                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        startIcon={<Lock className="h-4 w-4 text-slate-400" />}
                                    />
                                </div>
                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                            </div>

                            {!isLogin && (
                                <div className="space-y-1">
                                    <Label className="text-slate-700">ยืนยันรหัสผ่าน</Label>
                                    <div className="relative">
                                        <PasswordInput
                                            placeholder="••••••••"
                                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            startIcon={<Lock className="h-4 w-4 text-slate-400" />}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className={cn(
                                    "w-full h-12 rounded-xl text-base font-bold shadow-lg transition-all hover:scale-[1.02]",
                                    isLogin ? "shadow-orange-500/20" : "shadow-lime-600/20",
                                    buttonColor
                                )}
                            >
                                {isLogin ? "เข้าสู่ระบบทันที" : "สมัครสมาชิก"}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm text-slate-500">
                            {isLogin ? "ยังไม่มีบัญชีสมาชิก? " : "มีบัญชีอยู่แล้ว? "}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setErrors({});
                                }}
                                className={cn("font-bold hover:underline", isLogin ? "text-[#FB923C]" : "text-[#84CC16]")}
                            >
                                {isLogin ? "สมัครสมาชิกเลย" : "เข้าสู่ระบบ"}
                            </button>
                        </div>

                        <div className="mt-8 flex justify-center gap-4 text-xs text-slate-400">
                            <Link href="/privacy" className="hover:text-slate-600">นโยบายความเป็นส่วนตัว</Link>
                            <span>•</span>
                            <Link href="/help" className="hover:text-slate-600">ความช่วยเหลือ</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reset Password Dialog (Preserved) */}
            <Dialog
                open={isResetDialogOpen}
                onOpenChange={(open) => {
                    setIsResetDialogOpen(open);
                    if (!open) {
                        setIsSendingReset(false);
                        setResetEmail("");
                    }
                }}
            >
                <DialogContent className="max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-prompt text-xl">รีเซ็ตรหัสผ่าน</DialogTitle>
                        <DialogDescription className="font-prompt text-sm">
                            กรอกอีเมลที่ใช้สมัครเพื่อรับลิงก์รีเซ็ตรหัสผ่านภายในไม่กี่นาที
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Label htmlFor="reset-email" className="font-prompt text-sm">อีเมล</Label>
                        <Input
                            id="reset-email"
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="font-prompt"
                            autoFocus
                        />
                    </div>
                    <p className="text-xs text-muted-foreground font-prompt">
                        หากไม่พบอีเมลในกล่องจดหมาย กรุณาตรวจสอบโฟลเดอร์สแปมหรืออีเมลขยะ
                    </p>
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="font-prompt"
                            onClick={() => setIsResetDialogOpen(false)}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="button"
                            className="font-prompt bg-black text-white hover:bg-zinc-800"
                            disabled={isSendingReset}
                            onClick={handleSendPasswordReset}
                        >
                            {isSendingReset ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthPageContent />
        </Suspense>
    );
}
