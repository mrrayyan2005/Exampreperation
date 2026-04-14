import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, GripVertical, Plus, Type } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { RichTextBlock } from "./blocks/RichTextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { TableBlock } from "./blocks/TableBlock";
import { ChecklistBlock } from "./blocks/ChecklistBlock";
import { MathBlock } from "./blocks/MathBlock";
import { SlashCommandMenu, BlockType as SlashBlockType, getBlockLabel } from "./SlashCommandMenu";
import { BlockToolbar } from "./BlockToolbar";
import { generateId } from "@/lib/editor-utils";
import { cn } from "@/lib/utils";

// Extended Block Types
export type BlockType = 
    | 'text' 
    | 'heading' 
    | 'code' 
    | 'richText'
    | 'image'
    | 'table'
    | 'checklist'
    | 'quote'
    | 'divider'
    | 'math';

export interface Block {
    id: string;
    type: BlockType;
    content: string;
    language?: string;
    metadata?: {
        caption?: string;
        level?: number;
    };
}

// Flexible block for compatibility with different note formats
export interface FlexibleBlock {
    id?: string;
    type: string;
    content?: string | Array<{ text?: string; type?: string }>;
    language?: string;
    metadata?: {
        caption?: string;
        level?: number;
    };
}

export interface Document {
    _id?: string;
    id?: string;
    title: string;
    content?: {
        blocks: FlexibleBlock[];
    };
    tags: string[];
    updatedAt?: string;
}

interface DocumentEditorProps {
    document: Document | null;
    onDocumentChange: (document: Document) => void;
    onCreateNewNote?: () => void;
}

export function DocumentEditor({ document, onDocumentChange, onCreateNewNote }: DocumentEditorProps) {
    const [title, setTitle] = useState("");
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    
    // Slash command menu state
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuQuery, setSlashMenuQuery] = useState("");
    const [slashMenuIndex, setSlashMenuIndex] = useState<number | null>(null);
    const slashMenuRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    // Reset and load document when ID changes
    useEffect(() => {
        if (document) {
            // Reset all state first
            setTitle(document.title);
            setTags(document.tags || []);
            
            // Handle blocks - convert FlexibleBlock to Block
            const existingBlocks = document.content?.blocks || [];
            if (existingBlocks.length === 0) {
                // Auto-create a rich text block if document is empty
                const newBlock: Block = {
                    id: generateId(),
                    type: 'text',
                    content: '',
                };
                setBlocks([newBlock]);
            } else {
                // Convert FlexibleBlock[] to Block[] by ensuring all have IDs
                const convertedBlocks: Block[] = existingBlocks.map(block => ({
                    id: block.id || generateId(),
                    type: block.type as BlockType,
                    content: typeof block.content === 'string' ? block.content : JSON.stringify(block.content || ''),
                    language: block.language,
                    metadata: block.metadata,
                }));
                setBlocks(convertedBlocks);
            }
        }
    }, [document?.id]); // Only re-run when document ID changes

    const updateDocument = useCallback(() => {
        if (!document) return;

        const updatedDocument: Document = {
            ...document,
            title,
            content: { blocks },
            tags,
            updatedAt: new Date().toISOString()
        };

        onDocumentChange(updatedDocument);
    }, [document, title, blocks, tags, onDocumentChange]);

    // Auto-save on changes
    useEffect(() => {
        const timeout = setTimeout(updateDocument, 1000);
        return () => clearTimeout(timeout);
    }, [title, blocks, tags, updateDocument]);

    const addBlock = (type: SlashBlockType, index?: number) => {
        const newBlock: Block = {
            id: generateId(),
            type: type === 'richText' ? 'text' : type as BlockType,
            content: '',
            ...(type === 'code' && { language: 'javascript' }),
        };

        let newBlocks: Block[];
        if (index !== undefined) {
            newBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
        } else {
            newBlocks = [...blocks, newBlock];
        }
        
        setBlocks(newBlocks);
        setShowSlashMenu(false);
        setSlashMenuQuery("");
        setSlashMenuIndex(null);
    };

    const insertBlockAfter = (index: number) => {
        setSlashMenuIndex(index);
        setShowSlashMenu(true);
        setSlashMenuQuery("");
    };

    const updateBlock = (id: string, updates: Partial<Block>) => {
        const newBlocks = blocks.map(block =>
            block.id === id ? { ...block, ...updates } : block
        );
        setBlocks(newBlocks);
    };

    const removeBlock = (id: string) => {
        const newBlocks = blocks.filter(block => block.id !== id);
        setBlocks(newBlocks);
    };

    const moveBlock = (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if (index === -1) return;
        
        if (direction === 'up' && index > 0) {
            const newBlocks = [...blocks];
            [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
            setBlocks(newBlocks);
        } else if (direction === 'down' && index < blocks.length - 1) {
            const newBlocks = [...blocks];
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
            setBlocks(newBlocks);
        }
    };

    // Handle slash commands
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, blockId: string, blockIndex: number) => {
        const value = e.target.value;
        
        // Check for slash command
        if (value === '/') {
            setSlashMenuIndex(blockIndex);
            setShowSlashMenu(true);
            setSlashMenuQuery("");
        } else if (showSlashMenu && slashMenuIndex === blockIndex) {
            if (value.startsWith('/')) {
                setSlashMenuQuery(value.slice(1));
            } else {
                setShowSlashMenu(false);
                setSlashMenuQuery("");
                setSlashMenuIndex(null);
            }
        }

        updateBlock(blockId, { content: value });
    };

    const handleSlashSelect = (type: SlashBlockType) => {
        if (slashMenuIndex !== null && slashMenuIndex >= 0 && slashMenuIndex < blocks.length) {
            // Replace the current block if it's empty, otherwise insert after
            const currentBlock = blocks[slashMenuIndex];
            if (currentBlock && (currentBlock.content === '/' || currentBlock.content === '')) {
                const newBlock: Block = {
                    id: currentBlock.id,
                    type: type === 'richText' ? 'text' : type as BlockType,
                    content: '',
                    ...(type === 'code' && { language: 'javascript' }),
                };
                const newBlocks = [...blocks];
                newBlocks[slashMenuIndex] = newBlock;
                setBlocks(newBlocks);
            } else {
                addBlock(type, slashMenuIndex);
            }
        } else {
            // slashMenuIndex is -1 or invalid, just add new block at end
            addBlock(type);
        }
        setShowSlashMenu(false);
        setSlashMenuQuery("");
        setSlashMenuIndex(null);
    };

    const renderBlock = (block: Block, index: number) => {
        const isSlashActive = showSlashMenu && slashMenuIndex === index;

        const blockWrapper = (content: React.ReactNode) => (
            <div key={block.id} className="group relative mb-6">
                {/* Block Controls */}
                <div className={cn(
                    "absolute -left-10 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    isSlashActive && "opacity-100"
                )}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0}
                    >
                        ↑
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground cursor-grab"
                    >
                        <GripVertical size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={() => moveBlock(block.id, 'down')}
                        disabled={index === blocks.length - 1}
                    >
                        ↓
                    </Button>
                </div>

                <div className="relative">
                    {/* Block Type Label */}
                    <div className="flex items-center justify-between mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {getBlockLabel(block.type as SlashBlockType)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBlock(block.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        >
                            <X size={14} />
                        </Button>
                    </div>

                    {/* Block Content */}
                    {content}

                    {/* Slash Command Menu */}
                    {isSlashActive && (
                        <div className="absolute z-50 mt-2" ref={slashMenuRef}>
                            <SlashCommandMenu
                                query={slashMenuQuery}
                                onSelect={handleSlashSelect}
                                onClose={() => {
                                    setShowSlashMenu(false);
                                    setSlashMenuQuery("");
                                    setSlashMenuIndex(null);
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Insert After Button */}
                {!isSlashActive && (
                    <button
                        onClick={() => insertBlockAfter(index)}
                        className="absolute left-0 right-0 -bottom-3 h-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <div className="w-full h-px bg-border group-hover:bg-primary/30" />
                        <div className="absolute bg-background border rounded-full p-0.5">
                            <Plus size={12} className="text-muted-foreground" />
                        </div>
                    </button>
                )}
            </div>
        );

        switch (block.type) {
            case 'heading':
                return blockWrapper(
                    <Input
                        value={block.content}
                        onChange={(e) => handleInputChange(e, block.id, index)}
                        className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0"
                        placeholder="Enter heading..."
                    />
                );

            case 'richText':
            case 'text':
                return blockWrapper(
                    <div className="relative">
                        <RichTextBlock
                            content={block.content}
                            onChange={(content) => updateBlock(block.id, { content })}
                            placeholder="Type / for commands..."
                        />
                    </div>
                );

            case 'code':
                return blockWrapper(
                    <CodeBlock
                        content={block.content}
                        language={block.language}
                        onContentChange={(content) => updateBlock(block.id, { content })}
                        onLanguageChange={(language) => updateBlock(block.id, { language })}
                    />
                );

            case 'image':
                return blockWrapper(
                    <ImageBlock
                        url={block.content}
                        caption={block.metadata?.caption}
                        onChange={(url, caption) => updateBlock(block.id, { 
                            content: url, 
                            metadata: { ...block.metadata, caption } 
                        })}
                        onRemove={() => removeBlock(block.id)}
                    />
                );

            case 'table':
                return blockWrapper(
                    <TableBlock
                        content={block.content}
                        onChange={(content) => updateBlock(block.id, { content })}
                    />
                );

            case 'checklist':
                return blockWrapper(
                    <ChecklistBlock
                        content={block.content}
                        onChange={(content) => updateBlock(block.id, { content })}
                    />
                );

                    case 'quote':
                        return blockWrapper(
                            <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
                                <RichTextBlock
                                    content={block.content}
                                    onChange={(content) => updateBlock(block.id, { content })}
                                    placeholder="Enter quote..."
                                    onNoteLinkClick={(noteId) => {
                                        window.dispatchEvent(new CustomEvent('navigateToNote', { detail: { noteId } }));
                                    }}
                                />
                            </blockquote>
                        );

                    case 'math':
                        return blockWrapper(
                            <MathBlock
                                content={block.content}
                                onChange={(content) => updateBlock(block.id, { content })}
                                onRemove={() => removeBlock(block.id)}
                                displayMode={true}
                            />
                        );

            case 'divider':
                return blockWrapper(
                    <hr className="border-t-2 border-muted my-4" />
                );

            default:
                return null;
        }
    };

    if (!document) {
        return (
            <div className="flex-1 flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Select a note to edit</h2>
                    <p>Choose a note from the sidebar or create a new one</p>
                </div>
            </div>
        );
    }

    const handleToolbarAddBlock = (type: BlockType) => {
        addBlock(type as SlashBlockType);
    };

    return (
        <div ref={editorRef} className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full">
            {/* Persistent Block Toolbar */}
            <BlockToolbar onAddBlock={handleToolbarAddBlock} />

            {/* Document Title with New Note Button */}
            <div className="mb-8 mt-4">
                <div className="flex items-start justify-between gap-4">
                    <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-4xl font-bold bg-transparent border-none shadow-none outline-none w-full p-0 h-auto focus-visible:ring-0"
                        placeholder="Untitled Note"
                    />
                    {onCreateNewNote && (
                        <Button
                            onClick={onCreateNewNote}
                            className="shrink-0"
                            size="sm"
                        >
                            <Plus size={16} className="mr-2" />
                            New Note
                        </Button>
                    )}
                </div>

                {/* Document Meta */}
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span>Last edited {new Date(document.updatedAt).toLocaleString()}</span>
                    {tags.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span>•</span>
                            {tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Single Continuous Editor - Like Normal Text Editor */}
            <div className="flex-1 min-h-[calc(100vh-300px)]">
                {blocks.length > 0 ? (
                    <div className="relative group">
                        {/* Plain Text Area for entire document */}
                        <textarea
                            key={document?.id || 'empty'}
                            value={blocks.map(b => b.content).join('\n\n')}
                            onChange={(e) => {
                                const content = e.target.value;
                                // Update first block with all content
                                if (blocks[0]) {
                                    updateBlock(blocks[0].id, { content });
                                }
                            }}
                            placeholder="Start typing here..."
                            className="w-full min-h-[calc(100vh-300px)] resize-none bg-transparent border-none outline-none text-lg leading-relaxed p-0 font-sans"
                            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                        />
                    </div>
                ) : (
                    <div 
                        className="min-h-[calc(100vh-300px)] cursor-text flex items-start pt-8"
                        onClick={() => addBlock('richText')}
                    >
                        <span className="text-muted-foreground/50 text-lg">Click here to start typing...</span>
                    </div>
                )}
            </div>
        </div>
    );
}