"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useArticle } from "@/shared/hooks/useArticles";
import { useIsAdmin } from "@/hooks/useUserRole";
import { ArrowLeft, Calendar, User, Eye, PenSquare, Facebook, Link as LinkIcon, Check, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { alert as appAlert } from "@/shared/lib/alerts";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArticleDetailClientProps {
    id: string;
}

// Custom Image Renderer for React Markdown
const MarkdownImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { src, alt } = props;
    if (!src) return null;
    return (
        <span className="block relative w-full h-auto my-6 rounded-xl overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt || "Article Image"}
                className="w-full h-auto object-cover"
                loading="lazy"
            />
            {alt && <span className="block text-center text-sm text-muted-foreground mt-2 italic">{alt}</span>}
        </span>
    );
};

const ArticleDetailClient = ({ id }: ArticleDetailClientProps) => {
    const router = useRouter();
    const isAdmin = useIsAdmin();
    const { data: article, isLoading } = useArticle(id);
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            appAlert.success("คัดลอกลิงก์เรียบร้อยแล้ว");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleShareFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    const handleShareLine = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://social-plugins.line.me/lineit/share?url=${url}`, '_blank');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background py-16 flex items-center justify-center">
                <p className="text-muted-foreground font-prompt animate-pulse">กำลังโหลดบทความ...</p>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-background py-16 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h2 className="text-xl font-bold font-prompt mb-2">ไม่พบบทความ</h2>
                    <p className="text-muted-foreground font-prompt mb-6">บทความที่คุณค้นหาอาจถูกลบหรือไม่มีอยู่จริง</p>
                    <Button onClick={() => router.push("/knowledge")} className="font-prompt">
                        กลับสู่หน้าความรู้
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 pb-16">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Navigation and Actions */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        className="font-prompt gap-2 text-muted-foreground hover:text-foreground pl-0"
                        onClick={() => router.push("/knowledge")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        ย้อนกลับ
                    </Button>

                    {isAdmin && (
                        <Link href={`/knowledge/${article.id}/edit`}>
                            <Button variant="outline" className="font-prompt gap-2 bg-white/80 backdrop-blur-sm">
                                <PenSquare className="w-4 h-4" />
                                แก้ไขบทความ
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* LEFT COLUMN: Main Content */}
                    <article className="lg:col-span-8">
                        {/* Header Section */}
                        <header className="mb-8">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <Badge className="font-prompt text-base px-3 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
                                    {article.category}
                                </Badge>
                                <span className="text-sm text-muted-foreground font-prompt flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(article.created_at), "d MMMM yyyy", { locale: th })}
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-prompt leading-tight text-foreground mb-6">
                                {article.title}
                            </h1>

                            {/* Author & Stats (Mobile/Desktop) */}
                            <div className="flex items-center justify-between py-4 border-y border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold font-prompt">Admin</p>
                                        <p className="text-xs text-muted-foreground font-prompt">ผู้เขียน</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm font-prompt bg-muted/30 px-3 py-1 rounded-full">
                                    <Eye className="w-4 h-4" />
                                    <span>{article.views.toLocaleString()}</span>
                                    <span className="hidden sm:inline">การเข้าชม</span>
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        {article.image_url && (
                            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg mb-10 ring-1 ring-black/5">
                                <Image
                                    src={article.image_url}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        {/* Article Body (Markdown) */}
                        <div className="prose prose-lg prose-emerald max-w-none font-prompt 
                            prose-headings:font-bold prose-headings:text-foreground prose-headings:scroll-m-20
                            prose-p:text-muted-foreground prose-p:leading-relaxed 
                            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                            prose-img:rounded-xl prose-img:shadow-md
                            bg-white/50 p-6 sm:p-10 rounded-[32px] border border-white/60 shadow-sm"
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    img: MarkdownImage,
                                }}
                            >
                                {article.content}
                            </ReactMarkdown>
                        </div>
                    </article>

                    {/* RIGHT COLUMN: Sidebar (Desktop Sticky) */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Share Card */}
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <Card className="p-6 rounded-3xl shadow-card border-white/60 bg-white/80 backdrop-blur-md">
                                <h3 className="font-bold font-prompt text-lg mb-4">แชร์บทความนี้</h3>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={handleShareFacebook}
                                        className="w-full font-prompt bg-[#1877F2] hover:bg-[#1877F2]/90 text-white gap-2"
                                    >
                                        <Facebook className="w-4 h-4" />
                                        Facebook
                                    </Button>
                                    <Button
                                        onClick={handleShareLine}
                                        className="w-full font-prompt bg-[#06C755] hover:bg-[#06C755]/90 text-white gap-2"
                                    >
                                        <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center text-[10px] text-[#06C755] font-bold leading-none">L</div>
                                        LINE
                                    </Button>
                                    <Button
                                        disabled={copied}
                                        onClick={handleCopyLink}
                                        variant="outline"
                                        className="w-full font-prompt gap-2"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                                        {copied ? "คัดลอกลิงก์แล้ว" : "คัดลอกลิงก์"}
                                    </Button>
                                </div>
                            </Card>

                            {/* Related / CTA Card (Optional placeholder for future usage) */}
                            <Card className="p-6 rounded-3xl shadow-card border-white/60 bg-gradient-to-br from-orange-50 to-amber-50">
                                <h3 className="font-bold font-prompt text-lg mb-2 text-orange-800">เข้าร่วมชุมชน PetsKub</h3>
                                <p className="text-sm text-muted-foreground font-prompt mb-4">
                                    แลกเปลี่ยนประสบการณ์และช่วยเหลือสัตว์เลี้ยงไปด้วยกัน
                                </p>
                                <Button className="w-full font-prompt bg-orange-500 hover:bg-orange-600 text-white">
                                    เข้าสู่เว็บบอร์ด
                                </Button>
                            </Card>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetailClient;
