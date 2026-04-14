import { Search, FileText, Tag, Folder } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SearchMatch {
    note: {
        _id: string;
        title: string;
        content: {
            blocks: Array<{
                type: string;
                content: string;
            }>;
        };
        tags: string[];
        folderId?: {
            _id: string;
            name: string;
            color?: string;
        } | null;
        updatedAt: string;
        color?: string;
    };
    score: number;
    matches: Array<{
        field: 'title' | 'content' | 'tags';
        text: string;
        indices: Array<[number, number]>;
    }>;
}

interface SearchResultsProps {
    results: SearchMatch[];
    query: string;
    selectedId?: string;
    onSelect: (noteId: string) => void;
    className?: string;
}

function highlightText(text: string, query: string): React.ReactNode {
    if (!query) return text;
    
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
        regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded">
                {part}
            </mark>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface Block {
    type: string;
    content: string;
}

function getSnippet(blocks: Block[], query: string, maxLength: number = 120): string {
    const queryLower = query.toLowerCase();
    
    // Find a block that contains the query
    const matchingBlock = blocks.find(b => 
        b.content && b.content.toLowerCase().includes(queryLower)
    );
    
    if (matchingBlock) {
        const content = matchingBlock.content;
        const index = content.toLowerCase().indexOf(queryLower);
        const start = Math.max(0, index - 40);
        const end = Math.min(content.length, index + query.length + 40);
        const snippet = content.slice(start, end);
        
        return (start > 0 ? '...' : '') + snippet + (end < content.length ? '...' : '');
    }
    
    // Fallback to first text block
    const firstTextBlock = blocks.find(b => 
        b.type === 'text' || b.type === 'richText' || b.type === 'heading'
    );
    
    if (firstTextBlock) {
        return firstTextBlock.content.slice(0, maxLength) + 
            (firstTextBlock.content.length > maxLength ? '...' : '');
    }
    
    return '';
}

export function SearchResults({ 
    results, 
    query, 
    selectedId, 
    onSelect,
    className 
}: SearchResultsProps) {
    if (results.length === 0 && query) {
        return (
            <div className={cn("text-center py-8 text-muted-foreground", className)}>
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No results found for "{query}"</p>
            </div>
        );
    }

    return (
        <ScrollArea className={cn("h-full", className)}>
            <div className="space-y-2 p-2">
                {results.map(({ note, score }) => {
                    const snippet = getSnippet(note.content.blocks || [], query);
                    const isSelected = note._id === selectedId;
                    
                    return (
                        <button
                            key={note._id}
                            onClick={() => onSelect(note._id)}
                            className={cn(
                                "w-full text-left p-3 rounded-lg transition-all duration-200",
                                "hover:bg-accent hover:shadow-sm",
                                isSelected && "bg-accent ring-1 ring-primary/50"
                            )}
                        >
                            {/* Title */}
                            <div className="flex items-start gap-2 mb-1">
                                <FileText className={cn(
                                    "h-4 w-4 mt-0.5 shrink-0",
                                    note.color && `text-${note.color}-500`
                                )} />
                                <h4 className="font-medium line-clamp-1">
                                    {highlightText(note.title, query)}
                                </h4>
                            </div>
                            
                            {/* Snippet */}
                            {snippet && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2 pl-6">
                                    {highlightText(snippet, query)}
                                </p>
                            )}
                            
                            {/* Meta */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-6">
                                {note.folderId && (
                                    <span className="flex items-center gap-1">
                                        <Folder className="h-3 w-3" />
                                        {note.folderId.name}
                                    </span>
                                )}
                                
                                {note.tags.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Tag className="h-3 w-3" />
                                        {note.tags.slice(0, 2).map((tag, i) => (
                                            <Badge 
                                                key={i} 
                                                variant="secondary" 
                                                className="text-[10px] px-1 py-0"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                        {note.tags.length > 2 && (
                                            <span>+{note.tags.length - 2}</span>
                                        )}
                                    </div>
                                )}
                                
                                <span className="ml-auto">
                                    {formatDistanceToNow(new Date(note.updatedAt), { 
                                        addSuffix: true 
                                    })}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </ScrollArea>
    );
}