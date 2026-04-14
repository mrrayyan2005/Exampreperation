import { useState, useEffect, useRef, forwardRef } from 'react';
import {
    Text,
    Heading1,
    Heading2,
    Heading3,
    Code,
    Image as ImageIcon,
    Table,
    CheckSquare,
    List,
    Type,
    Quote,
    Minus,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type BlockType =
    | 'text'
    | 'heading'
    | 'code'
    | 'image'
    | 'table'
    | 'checklist'
    | 'richText'
    | 'quote'
    | 'divider'
    | 'math';

interface SlashCommandItem {
    id: BlockType;
    label: string;
    description: string;
    icon: React.ElementType;
    shortcut?: string;
    category: 'basic' | 'media' | 'advanced';
}

const COMMANDS: SlashCommandItem[] = [
    {
        id: 'richText',
        label: 'Rich Text',
        description: 'Rich text with formatting (bold, italic, links)',
        icon: Type,
        shortcut: 'text',
        category: 'basic'
    },
    {
        id: 'heading',
        label: 'Heading',
        description: 'Large section heading',
        icon: Heading1,
        shortcut: 'h1',
        category: 'basic'
    },
    {
        id: 'checklist',
        label: 'Checklist',
        description: 'Interactive todo list with checkboxes',
        icon: CheckSquare,
        shortcut: 'todo',
        category: 'basic'
    },
    {
        id: 'quote',
        label: 'Quote',
        description: 'Styled blockquote for citations',
        icon: Quote,
        shortcut: 'quote',
        category: 'basic'
    },
    {
        id: 'divider',
        label: 'Divider',
        description: 'Horizontal line separator',
        icon: Minus,
        shortcut: '---',
        category: 'basic'
    },
    {
        id: 'image',
        label: 'Image',
        description: 'Upload or embed an image',
        icon: ImageIcon,
        shortcut: 'img',
        category: 'media'
    },
    {
        id: 'table',
        label: 'Table',
        description: 'Data table with rows and columns',
        icon: Table,
        shortcut: 'table',
        category: 'media'
    },
    {
        id: 'code',
        label: 'Code Block',
        description: 'Syntax highlighted code',
        icon: Code,
        shortcut: 'code',
        category: 'advanced'
    },
    {
        id: 'math',
        label: 'Math Equation',
        description: 'LaTeX math equation',
        icon: () => <span className="text-sm font-serif">∑</span>,
        shortcut: 'math',
        category: 'advanced'
    }
];

interface SlashCommandMenuProps {
    query: string;
    onSelect: (type: BlockType) => void;
    onClose: () => void;
}

export const SlashCommandMenu = forwardRef<HTMLDivElement, SlashCommandMenuProps>(
    ({ query, onSelect, onClose }, ref) => {
        const [selectedIndex, setSelectedIndex] = useState(0);
        const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
        const containerRef = useRef<HTMLDivElement>(null);

        const filteredCommands = COMMANDS.filter(cmd =>
            cmd.label.toLowerCase().includes(query.toLowerCase()) ||
            cmd.shortcut?.toLowerCase().includes(query.toLowerCase()) ||
            cmd.description.toLowerCase().includes(query.toLowerCase())
        );

        // Group commands by category
        const basicCommands = filteredCommands.filter(c => c.category === 'basic');
        const mediaCommands = filteredCommands.filter(c => c.category === 'media');
        const advancedCommands = filteredCommands.filter(c => c.category === 'advanced');

        useEffect(() => {
            setSelectedIndex(0);
        }, [query]);

        // Handle click outside to close
        useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                // Don't close if clicking inside the menu
                if (containerRef.current && containerRef.current.contains(e.target as Node)) {
                    return;
                }
                // Don't close if clicking on the trigger/input element
                const target = e.target as HTMLElement;
                if (target.closest('[data-slash-trigger]')) {
                    return;
                }
                onClose();
            };

            const handleKeyDown = (e: KeyboardEvent) => {
                if (filteredCommands.length === 0) return;

                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        setSelectedIndex(prev =>
                            prev < filteredCommands.length - 1 ? prev + 1 : prev
                        );
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (filteredCommands[selectedIndex]) {
                            onSelect(filteredCommands[selectedIndex].id);
                        }
                        break;
                    case 'Escape':
                        e.preventDefault();
                        onClose();
                        break;
                }
            };

            // Use click instead of mousedown to avoid conflicts with button clicks
            const timeout = setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 50);

            window.addEventListener('keydown', handleKeyDown);

            return () => {
                clearTimeout(timeout);
                document.removeEventListener('click', handleClickOutside);
                window.removeEventListener('keydown', handleKeyDown);
            };
        }, [filteredCommands, selectedIndex, onSelect, onClose]);

        // Scroll selected item into view
        useEffect(() => {
            const selectedElement = itemRefs.current[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }, [selectedIndex]);

        const handleSelect = (e: React.MouseEvent | React.KeyboardEvent, commandId: BlockType) => {
            e.stopPropagation();
            e.preventDefault();
            onSelect(commandId);
        };

        const renderCommand = (command: SlashCommandItem, index: number) => {
            const Icon = command.icon;
            return (
                <button
                    key={command.id}
                    ref={el => { itemRefs.current[index] = el; }}
                    onClick={(e) => handleSelect(e, command.id)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={cn(
                        "w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-all cursor-pointer",
                        selectedIndex === index
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted"
                    )}
                >
                    <div className={cn(
                        "p-1.5 rounded-md shrink-0",
                        selectedIndex === index ? "bg-primary-foreground/20" : "bg-muted"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm flex items-center gap-2">
                            {command.label}
                            {command.shortcut && (
                                <span className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded font-mono",
                                    selectedIndex === index
                                        ? "bg-primary-foreground/20"
                                        : "bg-muted-foreground/10 text-muted-foreground"
                                )}>
                                    /{command.shortcut}
                                </span>
                            )}
                        </div>
                        <div className={cn(
                            "text-xs truncate",
                            selectedIndex === index ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                            {command.description}
                        </div>
                    </div>
                </button>
            );
        };

        if (filteredCommands.length === 0) {
            return (
                <div
                    ref={ref}
                    className="bg-popover border rounded-lg shadow-xl p-4 text-sm text-muted-foreground"
                >
                    <div className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        No commands found matching "{query}"
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">ESC</kbd> to close
                    </div>
                </div>
            );
        }

        let currentIndex = 0;

        return (
            <div
                ref={containerRef}
                className="bg-popover border rounded-xl shadow-2xl w-80 max-h-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-primary/10 rounded">
                            <Type className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold text-sm">Add Block</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="Close (ESC)"
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[400px] p-2 space-y-1">
                    {/* Basic Blocks */}
                    {basicCommands.length > 0 && (
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                Basic Blocks
                            </div>
                            {basicCommands.map(cmd => renderCommand(cmd, currentIndex++))}
                        </div>
                    )}

                    {/* Media Blocks */}
                    {mediaCommands.length > 0 && (
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                Media & Data
                            </div>
                            {mediaCommands.map(cmd => renderCommand(cmd, currentIndex++))}
                        </div>
                    )}

                    {/* Advanced Blocks */}
                    {advancedCommands.length > 0 && (
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                                Advanced
                            </div>
                            {advancedCommands.map(cmd => renderCommand(cmd, currentIndex++))}
                        </div>
                    )}
                </div>

                {/* Footer with keyboard hints */}
                <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-background border rounded">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-background border rounded">↓</kbd>
                            <span>navigate</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-background border rounded">Enter</kbd>
                            <span>select</span>
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-background border rounded">ESC</kbd>
                        <span>close</span>
                    </span>
                </div>
            </div>
        );
    }
);

SlashCommandMenu.displayName = 'SlashCommandMenu';

export function getBlockLabel(type: BlockType): string {
    const command = COMMANDS.find(c => c.id === type);
    return command?.label || type;
}

export { COMMANDS };
