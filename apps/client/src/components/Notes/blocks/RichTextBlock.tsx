import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { NoteLink } from '../extensions/NoteLink';
import { LinkSuggestions } from '../LinkSuggestions';
import { 
    Bold, 
    Italic, 
    Underline as UnderlineIcon, 
    Strikethrough,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Code,
    Undo,
    Redo,
    Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface RichTextBlockProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    onNoteLinkClick?: (noteId: string) => void;
}

export function RichTextBlock({ content, onChange, placeholder = 'Type something...', onNoteLinkClick }: RichTextBlockProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionQuery, setSuggestionQuery] = useState('');
    const [suggestionPos, setSuggestionPos] = useState<{ top: number; left: number } | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Disable Link and Underline from StarterKit since we add them separately
                link: false,
                underline: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-4 hover:text-primary/80',
                },
            }),
            Underline,
            Placeholder.configure({
                placeholder,
            }),
            NoteLink.configure({
                HTMLAttributes: {
                    class: 'note-link text-blue-600 hover:text-blue-800 underline underline-offset-4 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-1 rounded',
                },
                onNoteClick: (noteId: string) => {
                    onNoteLinkClick?.(noteId);
                },
                onOpenSuggestions: (query: string, pos: number) => {
                    // Calculate position for suggestions
                    if (editorRef.current) {
                        const rect = editorRef.current.getBoundingClientRect();
                        // Get cursor position from editor
                        const { view } = editor;
                        const coords = view.coordsAtPos(pos);
                        setSuggestionPos({
                            top: coords.top - rect.top + 30,
                            left: coords.left - rect.left,
                        });
                    }
                    setSuggestionQuery(query);
                    setShowSuggestions(true);
                },
            }),
        ],
        content: content || '<p></p>',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            // Only save if content changed (not just empty paragraph)
            onChange(html === '<p></p>' ? '' : html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px]',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL', previousUrl);
        
        if (url === null) return;
        
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-background">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    aria-label="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    aria-label="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                
                <Toggle
                    size="sm"
                    pressed={editor.isActive('underline')}
                    onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                    aria-label="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Toggle>
                
                <Toggle
                    size="sm"
                    pressed={editor.isActive('strike')}
                    onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                    aria-label="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    aria-label="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Toggle>
                
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    aria-label="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>

                <Toggle
                    size="sm"
                    pressed={editor.isActive('blockquote')}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    aria-label="Quote"
                >
                    <Quote className="h-4 w-4" />
                </Toggle>

                <Toggle
                    size="sm"
                    pressed={editor.isActive('code')}
                    onPressedChange={() => editor.chain().focus().toggleCode().run()}
                    aria-label="Inline Code"
                >
                    <Code className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <Toggle
                    size="sm"
                    pressed={editor.isActive('link')}
                    onPressedChange={setLink}
                    aria-label="Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </Toggle>

                <div className="flex-1" />

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="p-4 relative" ref={editorRef}>
                <EditorContent editor={editor} />
                
                {/* Note Link Suggestions */}
                {showSuggestions && suggestionPos && (
                    <LinkSuggestions
                        query={suggestionQuery}
                        position={suggestionPos}
                        onSelect={(noteId, title) => {
                            // Insert the note link
                            editor?.chain().focus().deleteRange({ 
                                from: editor.state.selection.from - 2, 
                                to: editor.state.selection.from 
                            }).insertContent(`[[${title}]]`).setNoteLink({ 
                                noteId, 
                                title 
                            }).run();
                            
                            setShowSuggestions(false);
                        }}
                        onClose={() => setShowSuggestions(false)}
                    />
                )}
            </div>
        </div>
    );
}
