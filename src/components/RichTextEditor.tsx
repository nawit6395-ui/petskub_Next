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
}

const MenuBar = ({ editor, onImageUpload }: { editor: Editor | null, onImageUpload?: (file: File) => Promise<string> }) => {
    const [linkUrl, setLinkUrl] = useState('');
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

    if (!editor) {
        return null;
    }

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
        <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10 backdrop-blur-sm">
            <div className="flex items-center gap-1 border-r pr-2 mr-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().undo().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={!editor.can().undo()}
                    className="h-8 w-8"
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().redo().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    disabled={!editor.can().redo()}
                    className="h-8 w-8"
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1 border-r pr-2 mr-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive('bold') && "bg-muted text-primary")}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive('italic') && "bg-muted text-primary")}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive('underline') && "bg-muted text-primary")}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive('strike') && "bg-muted text-primary")}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1 border-r pr-2 mr-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive('heading', { level: 1 }) && "bg-muted text-primary")}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive('heading', { level: 2 }) && "bg-muted text-primary")}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive('paragraph') && "bg-muted text-primary")}
                    title="Paragraph"
                >
                    <Type className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1 border-r pr-2 mr-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive({ textAlign: 'left' }) && "bg-muted text-primary")}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive({ textAlign: 'center' }) && "bg-muted text-primary")}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive({ textAlign: 'right' }) && "bg-muted text-primary")}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1 border-r pr-2 mr-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive('bulletList') && "bg-muted text-primary")}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive('orderedList') && "bg-muted text-primary")}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn("h-8 w-8", editor.isActive('blockquote') && "bg-muted text-primary")}
                    title="Blockquote"
                >
                    <Quote className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1">
                <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", editor.isActive('link') && "bg-muted text-primary")}
                            title="Link"
                            onClick={() => {
                                const previousUrl = editor.getAttributes('link').href;
                                setLinkUrl(previousUrl || '');
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="link-url" className="text-xs font-semibold">ลิงก์ URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="link-url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="h-8 text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setLink();
                                        }
                                    }}
                                />
                                <Button type="button" size="sm" onClick={setLink} className="h-8 w-8 p-0 shrink-0">
                                    <Check className="h-4 w-4" />
                                </Button>
                                {editor.isActive('link') && (
                                    <Button type="button" size="sm" variant="destructive" onClick={() => {
                                        editor.chain().focus().unsetLink().run();
                                        setIsLinkPopoverOpen(false);
                                    }} className="h-8 w-8 p-0 shrink-0">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", editor.isActive('image') && "bg-muted text-primary")}
                            title="Image"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3">
                        <div className="space-y-3">
                            <h4 className="font-medium leading-none text-sm">Insert Image</h4>
                            <div className="flex flex-col gap-2">
                                {onImageUpload && (
                                    <Button type="button" variant="outline" size="sm" className="w-full justify-start gap-2" onClick={addImage}>
                                        <Upload className="h-4 w-4" />
                                        Upload from Device
                                    </Button>
                                )}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or URL</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://example.com/image.jpg"
                                        className="h-8 text-sm"
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
                                    }} className="h-8 px-3">
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-yellow-500 hover:text-yellow-600"
                            title="Emoji"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <Smile className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none">
                        <EmojiPicker
                            onEmojiClick={(emojiData: any) => {
                                editor.chain().focus().insertContent(emojiData.emoji).run();
                            }}
                            width={300}
                            height={400}
                        />
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Text Color"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: editor.getAttributes('textStyle').color || 'transparent' }}>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">A</span>
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="flex gap-1 flex-wrap w-[140px]">
                            {['#000000', '#252525', '#555555', '#E53E3E', '#D69E2E', '#38A169', '#3182CE', '#805AD5', '#D53F8C'].map((color) => (
                                <button
                                    type="button"
                                    key={color}
                                    onClick={() => editor.chain().focus().setColor(color).run()}
                                    className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

const RichTextEditor = ({ content, onChange, onImageUpload, placeholder = "เขียนเนื้อหา...", editable = true }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg shadow-md max-w-full my-4',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
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
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4 font-prompt',
            },
        },
        immediatelyRender: false,
    });

    // Handle external content updates (e.g., initial load)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            // Only update if content is significantly different to avoid cursor jumps
            // Use a simple check or just do nothing if user is typing
            // For now, assume this runs mostly on mount or reset
            if (editor.getText() === '' && content) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-xl overflow-hidden shadow-sm bg-white focus-within:ring-2 focus-within:ring-ring ring-offset-2 transition-all">
            <MenuBar editor={editor} onImageUpload={onImageUpload} />
            <div className="bg-white min-h-[300px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default RichTextEditor;
