import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Folder,
    FolderOpen,
    Plus,
    MoreVertical,
    Trash2,
    Edit2,
    ChevronRight,
    ChevronDown,
    Inbox,
    Archive,
    Pin,
    Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";

export interface FolderType {
    _id: string;
    name: string;
    color?: string;
    icon?: string;
    parentId?: string | null;
    order: number;
}

interface FolderTreeProps {
    folders: FolderType[];
    selectedFolderId: string | null;
    onSelectFolder: (folderId: string | null) => void;
    onFoldersChange: () => void;
    noteCounts: Record<string, number>;
}

const FOLDER_COLORS = [
    { value: 'default', label: 'Default', bg: 'bg-muted' },
    { value: 'red', label: 'Red', bg: 'bg-red-100 text-red-700' },
    { value: 'blue', label: 'Blue', bg: 'bg-blue-100 text-blue-700' },
    { value: 'green', label: 'Green', bg: 'bg-green-100 text-green-700' },
    { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-100 text-yellow-700' },
    { value: 'purple', label: 'Purple', bg: 'bg-purple-100 text-purple-700' },
    { value: 'orange', label: 'Orange', bg: 'bg-orange-100 text-orange-700' },
    { value: 'pink', label: 'Pink', bg: 'bg-pink-100 text-pink-700' },
    { value: 'gray', label: 'Gray', bg: 'bg-gray-100 text-gray-700' },
];

export function FolderTree({
    folders,
    selectedFolderId,
    onSelectFolder,
    onFoldersChange,
    noteCounts
}: FolderTreeProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderColor, setNewFolderColor] = useState("default");
    const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
    const [editName, setEditName] = useState("");
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    const rootFolders = folders.filter(f => !f.parentId).sort((a, b) => a.order - b.order);

    const getChildFolders = (parentId: string) => {
        return folders.filter(f => f.parentId === parentId).sort((a, b) => a.order - b.order);
    };

    const toggleExpand = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            setIsLoading(true);
            await axiosInstance.post('/notes/folders', {
                name: newFolderName.trim(),
                color: newFolderColor
            });
            setNewFolderName("");
            setNewFolderColor("default");
            setIsCreateOpen(false);
            onFoldersChange();
            toast.success("Folder created");
        } catch (error) {
            console.error("Failed to create folder:", error);
            toast.error("Failed to create folder");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateFolder = async () => {
        if (!editingFolder || !editName.trim()) return;

        try {
            setIsLoading(true);
            await axiosInstance.put(`/notes/folders/${editingFolder._id}`, {
                name: editName.trim()
            });
            setEditingFolder(null);
            setEditName("");
            onFoldersChange();
            toast.success("Folder updated");
        } catch (error) {
            console.error("Failed to update folder:", error);
            toast.error("Failed to update folder");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!confirm("Delete this folder? Notes will be moved to All Notes.")) return;

        try {
            await axiosInstance.delete(`/notes/folders/${folderId}`);
            if (selectedFolderId === folderId) {
                onSelectFolder(null);
            }
            onFoldersChange();
            toast.success("Folder deleted");
        } catch (error) {
            console.error("Failed to delete folder:", error);
            toast.error("Failed to delete folder");
        }
    };

    const getFolderColorClass = (color?: string) => {
        const colorDef = FOLDER_COLORS.find(c => c.value === color);
        return colorDef?.bg || 'bg-muted';
    };

    const renderFolder = (folder: FolderType, level: number = 0) => {
        const childFolders = getChildFolders(folder._id);
        const hasChildren = childFolders.length > 0;
        const isExpanded = expandedFolders.has(folder._id);
        const isSelected = selectedFolderId === folder._id;
        const noteCount = noteCounts[folder._id] || 0;

        return (
            <div key={folder._id} style={{ marginLeft: level * 8 }}>
                <div
                    className={cn(
                        "group flex items-center gap-0.5 py-1 px-1.5 rounded-md cursor-pointer transition-all duration-150",
                        isSelected
                            ? "bg-white/[0.06] text-white"
                            : "text-white/50 hover:text-white/70 hover:bg-white/[0.03]"
                    )}
                >
                    {hasChildren ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(folder._id); }}
                            className="p-0.5 hover:bg-white/[0.06] rounded transition-colors"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                        </button>
                    ) : (
                        <span className="w-4" />
                    )}

                    <div
                        className="flex-1 flex items-center gap-1.5 min-w-0"
                        onClick={() => onSelectFolder(folder._id)}
                    >
                        {isExpanded ? (
                            <FolderOpen className="h-3.5 w-3.5 text-white/40" />
                        ) : (
                            <Folder className="h-3.5 w-3.5 text-white/40" />
                        )}
                        <span className="truncate flex-1 text-[12px]">{folder.name}</span>
                        {noteCount > 0 && (
                            <span className="text-[10px] text-white/25 tabular-nums">{noteCount}</span>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/60 hover:bg-white/[0.06] rounded"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-2.5 w-2.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-[#141414] border-white/[0.08]">
                            <DropdownMenuItem
                                onClick={() => {
                                    setEditingFolder(folder);
                                    setEditName(folder.name);
                                }}
                                className="text-white/70 focus:text-white focus:bg-white/[0.06] text-xs"
                            >
                                <Edit2 className="mr-2 h-3 w-3" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-400/80 focus:text-red-400 focus:bg-red-500/10 text-xs"
                                onClick={() => handleDeleteFolder(folder._id)}
                            >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {hasChildren && isExpanded && (
                    <div className="mt-0.5">
                        {childFolders.map(child => renderFolder(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-2">
            {/* Quick Filters */}
            <div className="space-y-0.5">
                <button
                    onClick={() => onSelectFolder(null)}
                    className={cn(
                        "w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors",
                        selectedFolderId === null ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                    )}
                >
                    <Inbox className="h-4 w-4" />
                    <span className="flex-1 text-left">All Notes</span>
                    <span className="text-xs text-muted-foreground">
                        {Object.values(noteCounts).reduce((a, b) => a + b, 0)}
                    </span>
                </button>
            </div>

            <div className="h-px bg-border my-2" />

            {/* Folders Header */}
            <div className="flex items-center justify-between px-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Folders
                </span>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create Folder</DialogTitle>
                            <DialogDescription>
                                Create a new folder to organize your notes.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    placeholder="Folder name"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {FOLDER_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => setNewFolderColor(color.value)}
                                            className={cn(
                                                "w-8 h-8 rounded-full border-2 transition-all",
                                                color.bg,
                                                newFolderColor === color.value
                                                    ? "border-foreground scale-110"
                                                    : "border-transparent hover:scale-105"
                                            )}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateFolder}
                                disabled={!newFolderName.trim() || isLoading}
                            >
                                {isLoading ? "Creating..." : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Folders List */}
            <ScrollArea className="h-[200px]">
                <div className="space-y-0.5 pr-2">
                    {rootFolders.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                            No folders yet
                        </div>
                    ) : (
                        rootFolders.map(folder => renderFolder(folder))
                    )}
                </div>
            </ScrollArea>

            {/* Edit Folder Dialog */}
            <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rename Folder</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Folder name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateFolder()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingFolder(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateFolder}
                            disabled={!editName.trim() || isLoading}
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}