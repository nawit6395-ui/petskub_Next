"use client";

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon,
    Heading1,
    Heading2,
    Quote,
    Undo,
    Redo,
    Type,
    X,
    Check,
    Smile,
    Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmojiPicker from 'emoji-picker-react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    onImageUpload?: (file: File) => Promise<string>;
    placeholder?: string;
    editable?: boolean;
    maxLength?: number;
    showCharCount?: boolean;
}

const MenuBar = ({ editor, onImageUpload, charCount, maxLength }: { editor: Editor | null, onImageUpload?: (file: File) => Promise<string>, charCount?: number, maxLength?: number }) => {
    const [linkUrl, setLinkUrl] = useState('');
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

    if (!editor) {
        return null;
    }

    const isOverLimit = maxLength && charCount && charCount > maxLength;

    const setLink = () => {
        if (linkUrl === null) {
            return;
        }

        if (linkUrl === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            setIsLinkPopoverOpen(false);
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        setIsLinkPopoverOpen(false);
        setLinkUrl('');
    };

    const addImage = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file && onImageUpload) {
                try {
                    const url = await onImageUpload(file);
                    if (url) {
                        editor.chain().focus().setImage({ src: url }).run();
                    }
                } catch (error) {
                    console.error("Image upload failed", error);
                }
            }
        };
        input.click();
    }, [editor, onImageUpload]);

    return (
        <div className="border-b bg-slate-50/80 p-1.5 sm:p-2 flex flex-wrap gap-0.5 sm:gap-1 items-center sticky top-0 z-10 backdrop-blur-sm">
            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5 sm:pr-2 sm:mr-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().undo().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={!editor.can().undo()}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80"
                    title="ย้อนกลับ"
                >
                    <Undo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().redo().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={!editor.can().redo()}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80"
                    title="ทำซ้ำ"
                >
                    <Redo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
            </div>

            {/* Text Format */}
            <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5 sm:pr-2 sm:mr-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('bold') && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="ตัวหนา"
                >
                    <Bold className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('italic') && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="ตัวเอียง"
                >
                    <Italic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('underline') && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="ขีดเส้นใต้"
                >
                    <UnderlineIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('strike') && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="ขีดทับ"
                >
                    <Strikethrough className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
            </div>

            {/* Headings - ซ่อนบนมือถือเล็ก */}
            <div className="hidden sm:flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5 sm:pr-2 sm:mr-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('heading', { level: 1 }) && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="หัวข้อใหญ่"
                >
                    <Heading1 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('heading', { level: 2 }) && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="หัวข้อรอง"
                >
                    <Heading2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('paragraph') && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="ย่อหน้า"
                >
                    <Type className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
            </div>

            {/* Alignment - ซ่อนบนมือถือเล็ก */}
            <div className="hidden sm:flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5 sm:pr-2 sm:mr-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive({ textAlign: 'left' }) && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="ชิดซ้าย"
                >
                    <AlignLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive({ textAlign: 'center' }) && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="กึ่งกลาง"
                >
                    <AlignCenter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive({ textAlign: 'right' }) && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="ชิดขวา"
                >
                    <AlignRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5 sm:pr-2 sm:mr-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('bulletList') && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="รายการแบบจุด"
                >
                    <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('orderedList') && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="รายการแบบตัวเลข"
                >
                    <ListOrdered className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80 hidden sm:flex", editor.isActive('blockquote') && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                    title="อ้างอิง"
                >
                    <Quote className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1">
                {/* Link */}
                <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('link') && "bg-orange-100 text-orange-600 hover:bg-orange-100")}
                            title="ลิงก์"
                            onClick={() => {
                                const previousUrl = editor.getAttributes('link').href;
                                setLinkUrl(previousUrl || '');
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 sm:w-80 p-3 rounded-xl">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="link-url" className="text-xs font-semibold font-prompt">ลิงก์ URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="link-url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="h-9 text-sm rounded-lg"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setLink();
                                        }
                                    }}
                                />
                                <Button type="button" size="sm" onClick={setLink} className="h-9 w-9 p-0 shrink-0 rounded-lg bg-orange-500 hover:bg-orange-600">
                                    <Check className="h-4 w-4" />
                                </Button>
                                {editor.isActive('link') && (
                                    <Button type="button" size="sm" variant="destructive" onClick={() => {
                                        editor.chain().focus().unsetLink().run();
                                        setIsLinkPopoverOpen(false);
                                    }} className="h-9 w-9 p-0 shrink-0 rounded-lg">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Image */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80", editor.isActive('image') && "bg-orange-100 text-orange-600")}
                            title="รูปภาพ"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 sm:w-80 p-3 rounded-xl">
                        <div className="space-y-3">
                            <h4 className="font-medium leading-none text-sm font-prompt">แทรกรูปภาพ</h4>
                            <div className="flex flex-col gap-2">
                                {onImageUpload && (
                                    <Button type="button" variant="outline" size="sm" className="w-full justify-start gap-2 h-10 rounded-lg font-prompt" onClick={addImage}>
                                        <Upload className="h-4 w-4" />
                                        อัพโหลดจากอุปกรณ์
                                    </Button>
                                )}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="bg-white px-2 text-muted-foreground font-prompt">หรือใส่ URL</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://example.com/image.jpg"
                                        className="h-9 text-sm rounded-lg"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const url = (e.target as HTMLInputElement).value;
                                                if (url) {
                                                    editor.chain().focus().setImage({ src: url }).run();
                                                }
                                            }
                                        }}
                                    />
                                    <Button type="button" size="sm" variant="secondary" onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        if (input.value) {
                                            editor.chain().focus().setImage({ src: input.value }).run();
                                        }
                                    }} className="h-9 px-3 rounded-lg font-prompt">
                                        เพิ่ม
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Emoji */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                            title="อีโมจิ"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <Smile className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none rounded-xl" align="end">
                        <EmojiPicker
                            onEmojiClick={(emojiData: any) => {
                                editor.chain().focus().insertContent(emojiData.emoji).run();
                            }}
                            width={280}
                            height={350}
                        />
                    </PopoverContent>
                </Popover>

                {/* Text Color */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-200/80 hidden sm:flex"
                            title="สีตัวอักษร"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <div className="w-4 h-4 rounded border-2 border-slate-300 flex items-center justify-center" style={{ backgroundColor: editor.getAttributes('textStyle').color || 'transparent' }}>
                                <span className="text-[8px] font-bold" style={{ color: editor.getAttributes('textStyle').color ? '#fff' : '#374151' }}>A</span>
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3 rounded-xl">
                        <p className="text-xs font-medium font-prompt mb-2 text-slate-600">เลือกสีตัวอักษร</p>
                        <div className="flex gap-1.5 flex-wrap w-[160px]">
                            {['#000000', '#374151', '#6B7280', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map((color) => (
                                <button
                                    type="button"
                                    key={color}
                                    onClick={() => editor.chain().focus().setColor(color).run()}
                                    className="w-7 h-7 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform ring-1 ring-slate-200"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Character Count */}
                {maxLength && (
                    <div className={cn(
                        "ml-auto pl-2 text-[10px] sm:text-xs font-prompt font-medium tabular-nums",
                        isOverLimit ? "text-red-500" : charCount && charCount > maxLength * 0.8 ? "text-amber-500" : "text-slate-400"
                    )}>
                        <span className={isOverLimit ? "font-bold" : ""}>{charCount?.toLocaleString()}</span>
                        <span className="text-slate-300 mx-0.5">/</span>
                        <span>{maxLength.toLocaleString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const RichTextEditor = ({ content, onChange, onImageUpload, placeholder = "เขียนเนื้อหา...", editable = true, maxLength, showCharCount = true }: RichTextEditorProps) => {
    const [charCount, setCharCount] = useState(0);
    
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl shadow-md max-w-full my-4 mx-auto',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-orange-600 underline cursor-pointer hover:text-orange-700',
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Placeholder.configure({
                placeholder,
                emptyNodeClass: 'first:before:text-slate-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none first:before:h-0',
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            const count = text.length;
            setCharCount(count);
            
            // ถ้าเกิน maxLength ให้แจ้งเตือน แต่ยังให้พิมพ์ได้ (จะ validate ตอน submit)
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[250px] sm:min-h-[300px] p-3 sm:p-4 font-prompt prose-headings:font-prompt prose-p:leading-relaxed prose-img:rounded-xl',
            },
        },
        immediatelyRender: false,
    });

    // Update char count on mount
    useEffect(() => {
        if (editor) {
            setCharCount(editor.getText().length);
        }
    }, [editor]);

    // Handle external content updates (e.g., initial load)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            if (editor.getText() === '' && content) {
                editor.commands.setContent(content);
                setCharCount(editor.getText().length);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return (
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white animate-pulse">
                <div className="h-12 bg-slate-100" />
                <div className="min-h-[250px] sm:min-h-[300px] bg-slate-50" />
            </div>
        );
    }

    const isOverLimit = maxLength && charCount > maxLength;

    return (
        <div className={cn(
            "border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm bg-white transition-all",
            isOverLimit 
                ? "ring-2 ring-red-300 border-red-300" 
                : "focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-300"
        )}>
            <MenuBar editor={editor} onImageUpload={onImageUpload} charCount={showCharCount ? charCount : undefined} maxLength={maxLength} />
            <div className="bg-white min-h-[250px] sm:min-h-[300px]">
                <EditorContent editor={editor} />
            </div>
            {/* Footer with tips */}
            <div className="border-t bg-slate-50/80 px-3 py-2 flex items-center justify-between gap-2">
                <p className="text-[10px] sm:text-xs text-slate-400 font-prompt">
                    💡 เคล็ดลับ: ใช้ <kbd className="px-1 py-0.5 bg-slate-200 rounded text-[9px] mx-0.5">Ctrl+B</kbd> ตัวหนา, <kbd className="px-1 py-0.5 bg-slate-200 rounded text-[9px] mx-0.5">Ctrl+I</kbd> ตัวเอียง
                </p>
                {maxLength && (
                    <div className={cn(
                        "text-[10px] sm:text-xs font-prompt font-medium tabular-nums sm:hidden",
                        isOverLimit ? "text-red-500" : charCount > maxLength * 0.8 ? "text-amber-500" : "text-slate-400"
                    )}>
                        {charCount.toLocaleString()}/{maxLength.toLocaleString()}
                    </div>
                )}
            </div>
            {isOverLimit && (
                <div className="bg-red-50 border-t border-red-200 px-3 py-2">
                    <p className="text-xs text-red-600 font-prompt flex items-center gap-1.5">
                        <span>⚠️</span>
                        <span>เกินจำนวนตัวอักษรที่กำหนด ({(charCount - maxLength).toLocaleString()} ตัวอักษร)</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;
