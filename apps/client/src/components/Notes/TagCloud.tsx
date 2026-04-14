import { useState, useEffect, useMemo } from 'react';
import { X, Hash, Filter, Plus, Trash2, Edit3, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';

interface TagStats {
    name: string;
    count: number;
    color?: string;
}

interface TagCloudProps {
    tags: string[];
    allTags: TagStats[];
    selectedTags: string[];
    onTagSelect: (tag: string) => void;
    onTagRemove: (tag: string) => void;
    onTagsChange?: () => void;
    noteId?: string;
    className?: string;
}

export function TagCloud({
    tags,
    allTags,
    selectedTags,
    onTagSelect,
    onTagRemove,
    onTagsChange,
    noteId,
    className
}: TagCloudProps) {
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [newTagName, setNewTagName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate tag sizes based on frequency
    const maxCount = useMemo(() => {
        return Math.max(...allTags.map(t => t.count), 1);
    }, [allTags]);

    const getTagSize = (count: number) => {
        const ratio = count / maxCount;
        if (ratio > 0.8) return 'text-lg px-3 py-1';
        if (ratio > 0.5) return 'text-base px-2.5 py-0.5';
        if (ratio > 0.3) return 'text-sm px-2 py-0.5';
        return 'text-xs px-1.5 py-0.5';
    };

    const filteredTags = useMemo(() => {
        if (!searchQuery) return allTags;
        return allTags.filter(t => 
            t.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allTags, searchQuery]);

    const handleRenameTag = async (oldName: string, newName: string) => {
        if (!newName.trim() || oldName === newName) {
            setEditingTag(null);
            return;
        }

        try {
            const response = await axiosInstance.post('/notes/tags/rename', {
                oldName,
                newName: newName.trim()
            });

            if (response.data.success) {
                toast.success(`Tag renamed to "${newName}"`);
                onTagsChange?.();
                setEditingTag(null);
            }
        } catch (error) {
            console.error('Failed to rename tag:', error);
            toast.error('Failed to rename tag');
        }
    };

    const handleDeleteTag = async (tagName: string) => {
        try {
            const response = await axiosInstance.delete(`/notes/tags/${encodeURIComponent(tagName)}`);

            if (response.data.success) {
                toast.success(`Tag "${tagName}" deleted`);
                onTagsChange?.();
            }
        } catch (error) {
            console.error('Failed to delete tag:', error);
            toast.error('Failed to delete tag');
        }
    };

    const handleMergeTags = async (sourceTag: string, targetTag: string) => {
        try {
            const response = await axiosInstance.post('/notes/tags/merge', {
                sourceTag,
                targetTag
            });

            if (response.data.success) {
                toast.success(`Tags merged into "${targetTag}"`);
                onTagsChange?.();
            }
        } catch (error) {
            console.error('Failed to merge tags:', error);
            toast.error('Failed to merge tags');
        }
    };

    const suggestedTags = useMemo(() => {
        // Suggest tags not already on this note
        return allTags
            .filter(t => !tags.includes(t.name))
            .slice(0, 5);
    }, [allTags, tags]);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Current Note Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "secondary"}
                            className={cn(
                                "cursor-pointer transition-all hover:scale-105",
                                selectedTags.includes(tag) && "ring-2 ring-primary"
                            )}
                            onClick={() => onTagSelect(tag)}
                        >
                            <Hash className="h-3 w-3 mr-1" />
                            {tag}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTagRemove(tag);
                                }}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Tag Cloud */}
            {allTags.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-muted-foreground">
                            All Tags ({allTags.length})
                        </h4>
                        <div className="flex items-center gap-1">
                            {selectedTags.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => selectedTags.forEach(onTagRemove)}
                                >
                                    Clear filters
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setIsManageOpen(true)}
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                        {allTags.map((tag) => (
                            <button
                                key={tag.name}
                                onClick={() => onTagSelect(tag.name)}
                                className={cn(
                                    "rounded-full border transition-all hover:scale-105",
                                    getTagSize(tag.count),
                                    selectedTags.includes(tag.name)
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-accent"
                                )}
                                title={`${tag.name} (${tag.count} notes)`}
                            >
                                #{tag.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggested Tags */}
            {suggestedTags.length > 0 && noteId && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                        Suggested Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {suggestedTags.map((tag) => (
                            <Button
                                key={tag.name}
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => onTagSelect(tag.name)}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                {tag.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tag Management Dialog */}
            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Tags</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Input
                            placeholder="Search tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                                {filteredTags.map((tag) => (
                                    <div
                                        key={tag.name}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted group"
                                    >
                                        {editingTag === tag.name ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <Input
                                                    value={newTagName}
                                                    onChange={(e) => setNewTagName(e.target.value)}
                                                    className="h-8"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleRenameTag(tag.name, newTagName);
                                                        } else if (e.key === 'Escape') {
                                                            setEditingTag(null);
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleRenameTag(tag.name, newTagName)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{tag.name}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {tag.count}
                                                    </Badge>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setEditingTag(tag.name);
                                                                setNewTagName(tag.name);
                                                            }}
                                                        >
                                                            <Edit3 className="h-4 w-4 mr-2" />
                                                            Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteTag(tag.name)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}