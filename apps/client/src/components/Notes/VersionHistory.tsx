import { useState, useEffect } from 'react';
import { History, RotateCcw, Trash2, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';

interface Version {
    _id: string;
    version: number;
    title: string;
    snapshotAt: string;
    changeDescription?: string;
    wordCount: number;
    charCount: number;
}

interface Block {
    type: string;
    content: string;
}

interface VersionHistoryProps {
    noteId: string;
    isOpen: boolean;
    onClose: () => void;
    onRestore: () => void;
}

export function VersionHistory({ noteId, isOpen, onClose, onRestore }: VersionHistoryProps) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [versionDetails, setVersionDetails] = useState<{
        content?: { blocks?: Block[] };
        tags?: string[];
        wordCount?: number;
        charCount?: number;
    } | null>(null);

    useEffect(() => {
        if (isOpen && noteId) {
            fetchVersions();
        }
    }, [isOpen, noteId]);

    useEffect(() => {
        if (selectedVersion) {
            fetchVersionDetails(selectedVersion._id);
        }
    }, [selectedVersion]);

    const fetchVersions = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(`/notes/versions/note/${noteId}`);
            if (response.data.success) {
                setVersions(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
            toast.error('Failed to load version history');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVersionDetails = async (versionId: string) => {
        try {
            const response = await axiosInstance.get(`/notes/versions/${versionId}`);
            if (response.data.success) {
                setVersionDetails(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch version details:', error);
        }
    };

    const handleRestore = async (versionId: string) => {
        try {
            setIsRestoring(true);
            const response = await axiosInstance.post(`/notes/versions/${versionId}/restore`);
            if (response.data.success) {
                toast.success('Version restored successfully');
                onRestore();
                onClose();
            }
        } catch (error) {
            console.error('Failed to restore version:', error);
            toast.error('Failed to restore version');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleDelete = async (versionId: string) => {
        try {
            const response = await axiosInstance.delete(`/notes/versions/${versionId}`);
            if (response.data.success) {
                toast.success('Version deleted');
                setVersions(versions.filter(v => v._id !== versionId));
                if (selectedVersion?._id === versionId) {
                    setSelectedVersion(null);
                    setVersionDetails(null);
                }
            }
        } catch (error) {
            console.error('Failed to delete version:', error);
            toast.error('Failed to delete version');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Version History
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 gap-6 mt-4 overflow-hidden">
                    {/* Versions List */}
                    <div className="w-72 shrink-0 border-r pr-4">
                        <ScrollArea className="h-full">
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                                </div>
                            ) : versions.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No versions found</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {versions.map((version) => (
                                        <button
                                            key={version._id}
                                            onClick={() => setSelectedVersion(version)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg border transition-all",
                                                selectedVersion?._id === version._id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-primary/30"
                                            )}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        Version {version.version}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {new Date(version.snapshotAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                {version._id === versions[0]?._id && (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        Latest
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <div className="text-xs text-muted-foreground mt-2 truncate">
                                                {version.title}
                                            </div>
                                            
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                <span>{version.wordCount} words</span>
                                                <span>{version.charCount} chars</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Version Details */}
                    <div className="flex-1 min-w-0">
                        {selectedVersion ? (
                            <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold">{selectedVersion.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Version {selectedVersion.version} • {new Date(selectedVersion.snapshotAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(selectedVersion._id)}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleRestore(selectedVersion._id)}
                                            disabled={isRestoring}
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            {isRestoring ? 'Restoring...' : 'Restore'}
                                        </Button>
                                    </div>
                                </div>

                                {versionDetails && (
                                    <ScrollArea className="flex-1 border rounded-lg p-4">
                                        {/* Content Preview */}
                                        <div className="space-y-4">
                                            {versionDetails.content?.blocks?.map((block: Block, index: number) => (
                                                <div key={index} className="border-b pb-3 last:border-0">
                                                    {block.type === 'heading' && (
                                                        <h4 className="text-lg font-semibold">{block.content}</h4>
                                                    )}
                                                    {block.type === 'text' && (
                                                        <p className="text-muted-foreground">{block.content}</p>
                                                    )}
                                                    {block.type === 'richText' && (
                                                        <div 
                                                            className="prose prose-sm max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: block.content }}
                                                        />
                                                    )}
                                                    {block.type === 'code' && (
                                                        <pre className="bg-muted p-2 rounded text-sm font-mono">
                                                            {block.content}
                                                        </pre>
                                                    )}
                                                    {block.type === 'quote' && (
                                                        <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
                                                            {block.content}
                                                        </blockquote>
                                                    )}
                                                    {block.type === 'math' && (
                                                        <div className="bg-muted p-2 rounded text-center font-mono">
                                                            {block.content}
                                                        </div>
                                                    )}
                                                    {block.type === 'checklist' && (
                                                        <ul className="space-y-1">
                                                            {(() => {
                                                                try {
                                                                    return (JSON.parse(block.content || '[]') as Array<{ text: string; checked: boolean }>).map((item, i) => (
                                                                        <li key={i} className="flex items-center gap-2">
                                                                            <span className={cn(
                                                                                "w-4 h-4 border rounded flex items-center justify-center text-xs",
                                                                                item.checked && "bg-primary text-primary-foreground"
                                                                            )}>
                                                                                {item.checked && '✓'}
                                                                            </span>
                                                                            <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                                                                                {item.text}
                                                                            </span>
                                                                        </li>
                                                                    ));
                                                                } catch (e) {
                                                                    return <li className="text-destructive text-xs italic">Failed to load checklist</li>;
                                                                }
                                                            })()}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tags */}
                                        {versionDetails.tags && versionDetails.tags.length > 0 && (
                                            <div className="mt-6 pt-4 border-t">
                                                <p className="text-sm font-medium mb-2">Tags:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {versionDetails.tags.map((tag: string, i: number) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="mt-6 pt-4 border-t flex items-center gap-6 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                {versionDetails.wordCount} words
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {versionDetails.charCount} characters
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Blocks:</span>
                                                {versionDetails.content?.blocks?.length || 0}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                <History className="h-16 w-16 mb-4 opacity-20" />
                                <p>Select a version to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}