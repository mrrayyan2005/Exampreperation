import { useState, useEffect, useCallback } from 'react';
import { BlockNoteEditor as BlockNoteCore } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface BlockNoteEditorProps {
  document: {
    _id: string;
    id?: string;
    title: string;
    content?: { blocks?: any[] };
    tags: string[];
    updatedAt?: string;
  } | null;
  onDocumentChange: (doc: {
    _id: string;
    title: string;
    content: { blocks: any[] };
    tags: string[];
  }) => void;
  onCreateNewNote?: () => void;
}

export function BlockNoteEditor({ document, onDocumentChange, onCreateNewNote }: BlockNoteEditorProps) {
  const [title, setTitle] = useState(document.title);
  const [tags, setTags] = useState<string[]>(document.tags || []);
  const [newTag, setNewTag] = useState('');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Transform old block format to BlockNote format
  // BlockNote expects content as an array of inline content objects
  const transformBlocks = (blocks: any[]): any[] => {
    if (!blocks || blocks.length === 0) {
      return [{ type: 'paragraph', content: [] }];
    }

    // Helper to convert string content to BlockNote inline content format
    const toInlineContent = (content: string): any[] => {
      if (!content || content === '') return [];
      return [{ type: 'text', text: content }];
    };

    const transformedBlocks = blocks.map(block => {
      // Map old "text" type to "paragraph"
      if (block.type === 'text') {
        return {
          type: 'paragraph',
          content: toInlineContent(block.content),
        };
      }
      // Map "richText" to "paragraph"
      if (block.type === 'richText') {
        return {
          type: 'paragraph',
          content: toInlineContent(block.content),
        };
      }
      // Map "heading" - BlockNote uses "heading" with props
      if (block.type === 'heading') {
        return {
          type: 'heading',
          props: { level: block.metadata?.level || 1 },
          content: toInlineContent(block.content),
        };
      }
      // Map "code" - BlockNote uses "codeBlock"
      if (block.type === 'code') {
        return {
          type: 'codeBlock',
          props: { language: block.language || 'javascript' },
          content: block.content || '', // codeBlock uses string content
        };
      }
      // Map "checklist" to "checkListItem"
      if (block.type === 'checklist') {
        return {
          type: 'checkListItem',
          content: toInlineContent(block.content),
        };
      }
      // Map "quote" to "blockquote"
      if (block.type === 'quote') {
        return {
          type: 'blockquote',
          content: toInlineContent(block.content),
        };
      }
      // Map "divider" - BlockNote uses the horizontalRule inline, not a block
      if (block.type === 'divider') {
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: '---' }],
        };
      }
      // For blocks that already have content array, keep as-is
      if (Array.isArray(block.content)) {
        return block;
      }
      // Default: convert to paragraph with inline content
      return {
        type: 'paragraph',
        content: toInlineContent(block.content),
      };
    });

    return transformedBlocks;
  };

  // Transform blocks for BlockNote format
  const initialBlocks = transformBlocks(document.content?.blocks);

  // Create editor instance - this is memoized internally by the hook
  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
  });

  // Handle content changes with debounce
  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      const blocks = editor.topLevelBlocks;
      handleSave(blocks);
    };

    // Subscribe to changes
    editor.onChange(handleChange);
  }, [editor]);

  useEffect(() => {
    setTitle(document.title);
    setTags(document.tags || []);
  }, [document._id]);

  const handleSave = useCallback(
    (blocks: any[]) => {
      onDocumentChange({
        _id: document._id,
        title: title || 'Untitled Note',
        content: { blocks },
        tags,
      });
    },
    [document._id, title, tags, onDocumentChange]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (editor) {
      handleSave(editor.topLevelBlocks);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      if (editor) {
        onDocumentChange({
          _id: document._id,
          title: title || 'Untitled Note',
          content: { blocks: editor.topLevelBlocks },
          tags: updatedTags,
        });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    if (editor) {
      onDocumentChange({
        _id: document._id,
        title: title || 'Untitled Note',
        content: { blocks: editor.topLevelBlocks },
        tags: updatedTags,
      });
    }
  };

  return (
    <motion.div
      key={document._id} // Force re-mount when document changes
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full flex flex-col"
    >
      {/* Title Section - Premium Dark */}
      <div className="mb-8 space-y-3">
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled Note"
          className={cn(
            "text-[32px] font-semibold border-0 bg-transparent px-0 text-foreground/90 tracking-tight",
            "placeholder:text-muted-foreground/30",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-all duration-200"
          )}
        />

        {/* Meta info & Tags Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground/50">
            {document.updatedAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{new Date(document.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className={cn(
                  "group flex items-center gap-1 px-1.5 py-0.5",
                  "bg-muted/50 text-muted-foreground hover:bg-muted border-0",
                  "transition-all duration-150 cursor-pointer text-[11px] font-normal rounded"
                )}
                onClick={() => handleRemoveTag(tag)}
              >
                {tag}
                <X className="w-2.5 h-2.5 opacity-40 group-hover:opacity-70 transition-opacity" />
              </Badge>
            ))}
            <div className="flex items-center gap-1">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                }}
                placeholder="+ tag"
                className={cn(
                  "w-16 h-6 text-[11px] bg-muted/30 border-border/50 text-muted-foreground placeholder:text-muted-foreground/40 rounded",
                  "focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:border-ring/30"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editor - Dark Theme */}
      <div className={cn(
        "flex-1 min-h-0",
        "bn-dark-theme"
      )}>
        {editor && (
          <BlockNoteView
            editor={editor}
            theme={isDark ? 'dark' : 'light'}
            className={cn(
              "h-full overflow-y-auto",
              "[&_.bn-container]:bg-transparent",
              "[&_.bn-editor]:min-h-[300px]",
              "[&_.bn-editor]:text-base",
              "[&_.bn-editor]:leading-relaxed",
              isDark ? "[&_.bn-editor]:text-white/80" : "[&_.bn-editor]:text-foreground/80",
              // Compact block styling
              "[&_.bn-block]:border-l-2 [&_.bn-block]:border-transparent [&_.bn-block]:hover:border-border/50",
              "[&_.bn-block]:py-0.5",
              isDark ? "[&_.bn-block-content]:text-white/80" : "[&_.bn-block-content]:text-foreground/80",
              "[&_.bn-block-content]:py-0.5",
              // Reduce heading sizes
              "[&_[data-content-type=\"heading\"]]:text-white/90",
              "[&_[data-content-type=\"heading\"][data-level=\"1\"]]:text-2xl",
              "[&_[data-content-type=\"heading\"][data-level=\"2\"]]:text-xl",
              "[&_[data-content-type=\"heading\"][data-level=\"3\"]]:text-lg",
              // Paragraph spacing
              "[&_[data-content-type=\"paragraph\"]]:my-1",
              // Side menu
              "[&_.bn-side-menu]:text-white/30",
              // Toolbars
              isDark && "[&_.bn-formatting-toolbar]:bg-[#1a1a1a] [&_.bn-formatting-toolbar]:border-white/10",
              isDark && "[&_.bn-suggestion-menu]:bg-[#1a1a1a] [&_.bn-suggestion-menu]:border-white/10",
              isDark && "[&_.bn-slash-menu]:bg-[#1a1a1a] [&_.bn-slash-menu]:border-white/10"
            )}
          />
        )}
      </div>
    </motion.div>
  );
}

export default BlockNoteEditor;
