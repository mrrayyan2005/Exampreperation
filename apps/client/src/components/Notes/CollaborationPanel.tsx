import { useState, useEffect } from 'react';
import {
    Users,
    MessageSquare,
    Plus,
    X,
    Trash2,
    Check,
    MoreHorizontal,
    Eye,
    MessageCircle,
    Edit3,
    Send,
    Reply,
    Smile,
    CheckCircle2,
    Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosInstance';
import { formatDistanceToNow } from 'date-fns';

interface CollaborationPanelProps {
    noteId: string | null;
    isOpen: boolean;
    onClose: () => void;
    isOwner: boolean;
}

interface Collaborator {
    _id: string;
    userId: string;
    userName: string;
    userEmail: string;
    permission: 'view' | 'comment' | 'edit';
    joinedAt: string;
}

interface Comment {
    _id: string;
    userId: string;
    userName: string;
    content: string;
    blockId?: string;
    parentCommentId?: string;
    resolved: boolean;
    reactions: Array<{ userId: string; emoji: string }>;
    createdAt: string;
    updatedAt: string;
}

const PERMISSION_ICONS = {
    view: Eye,
    comment: MessageCircle,
    edit: Edit3,
};

const PERMISSION_LABELS = {
    view: 'Can view',
    comment: 'Can comment',
    edit: 'Can edit',
};

const REACTION_EMOJIS = ['👍', '❤️', '😄', '🎉', '🤔', '👏'];

export function CollaborationPanel({ noteId, isOpen, onClose, isOwner }: CollaborationPanelProps) {
    const [activeTab, setActiveTab] = useState('comments');
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
    const [newCollaboratorPermission, setNewCollaboratorPermission] = useState<'view' | 'comment' | 'edit'>('view');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (noteId && isOpen) {
            fetchCollaborators();
            fetchComments();
        }
    }, [noteId, isOpen]);

    const fetchCollaborators = async () => {
        if (!noteId) return;
        try {
            const response = await axiosInstance.get(`/collaboration/${noteId}/collaborators`);
            if (response.data.success) {
                setCollaborators(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch collaborators:', error);
        }
    };

    const fetchComments = async () => {
        if (!noteId) return;
        try {
            const response = await axiosInstance.get(`/collaboration/${noteId}/comments`);
            if (response.data.success) {
                setComments(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const addCollaborator = async () => {
        if (!noteId || !newCollaboratorEmail.trim()) return;

        setIsLoading(true);
        try {
            // In a real app, you'd look up the user by email first
            // For now, we'll simulate with a mock user ID
            const response = await axiosInstance.post(`/collaboration/${noteId}/collaborators`, {
                userEmail: newCollaboratorEmail,
                userId: 'mock-user-id', // This would come from user lookup
                userName: newCollaboratorEmail.split('@')[0], // Extract name from email
                permission: newCollaboratorPermission,
            });

            if (response.data.success) {
                toast.success('Collaborator added');
                setNewCollaboratorEmail('');
                fetchCollaborators();
            }
        } catch (error) {
            const axiosError = error as { response?: { data?: { error?: string } } };
            toast.error(axiosError.response?.data?.error || 'Failed to add collaborator');
        } finally {
            setIsLoading(false);
        }
    };

    const removeCollaborator = async (collaboratorId: string) => {
        if (!noteId) return;

        try {
            await axiosInstance.delete(`/collaboration/${noteId}/collaborators/${collaboratorId}`);
            toast.success('Collaborator removed');
            fetchCollaborators();
        } catch (error) {
            toast.error('Failed to remove collaborator');
        }
    };

    const updatePermission = async (collaboratorId: string, permission: 'view' | 'comment' | 'edit') => {
        if (!noteId) return;

        try {
            await axiosInstance.put(`/collaboration/${noteId}/collaborators/${collaboratorId}`, {
                permission,
            });
            toast.success('Permission updated');
            fetchCollaborators();
        } catch (error) {
            toast.error('Failed to update permission');
        }
    };

    const addComment = async () => {
        if (!noteId || !newComment.trim()) return;

        try {
            const response = await axiosInstance.post(`/collaboration/${noteId}/comments`, {
                content: newComment,
            });

            if (response.data.success) {
                setNewComment('');
                fetchComments();
            }
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const addReply = async (parentId: string) => {
        if (!noteId || !replyContent.trim()) return;

        try {
            await axiosInstance.post(`/collaboration/${noteId}/comments`, {
                content: replyContent,
                parentCommentId: parentId,
            });

            setReplyContent('');
            setReplyingTo(null);
            fetchComments();
        } catch (error) {
            toast.error('Failed to add reply');
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            await axiosInstance.delete(`/collaboration/comments/${commentId}`);
            toast.success('Comment deleted');
            fetchComments();
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    const toggleResolve = async (commentId: string) => {
        try {
            await axiosInstance.post(`/collaboration/comments/${commentId}/resolve`);
            fetchComments();
        } catch (error) {
            toast.error('Failed to update comment');
        }
    };

    const addReaction = async (commentId: string, emoji: string) => {
        try {
            await axiosInstance.post(`/collaboration/comments/${commentId}/reactions`, {
                emoji,
            });
            fetchComments();
        } catch (error) {
            toast.error('Failed to add reaction');
        }
    };

    if (!isOpen) return null;

    const unresolvedComments = comments.filter(c => !c.resolved && !c.parentCommentId);
    const resolvedComments = comments.filter(c => c.resolved && !c.parentCommentId);
    const replies = comments.filter(c => c.parentCommentId);

    const getReplies = (parentId: string) => replies.filter(r => r.parentCommentId === parentId);

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Collaboration</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="mx-4 mt-4">
                    <TabsTrigger value="comments" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comments
                        {unresolvedComments.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {unresolvedComments.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="collaborators" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        People
                        {collaborators.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {collaborators.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Comments Tab */}
                <TabsContent value="comments" className="flex-1 flex flex-col mt-0">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {/* New Comment Input */}
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="min-h-[80px] resize-none"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={addComment}
                                        disabled={!newComment.trim()}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Comment
                                    </Button>
                                </div>
                            </div>

                            {/* Unresolved Comments */}
                            {unresolvedComments.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        Active Comments
                                    </h4>
                                    {unresolvedComments.map((comment) => (
                                        <CommentCard
                                            key={comment._id}
                                            comment={comment}
                                            replies={getReplies(comment._id)}
                                            onReply={() => setReplyingTo(comment._id)}
                                            onDelete={() => deleteComment(comment._id)}
                                            onResolve={() => toggleResolve(comment._id)}
                                            onReact={(emoji) => addReaction(comment._id, emoji)}
                                            isOwner={isOwner}
                                            replyingTo={replyingTo}
                                            replyContent={replyContent}
                                            setReplyContent={setReplyContent}
                                            onSubmitReply={() => addReply(comment._id)}
                                            onCancelReply={() => setReplyingTo(null)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Resolved Comments */}
                            {resolvedComments.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        Resolved
                                    </h4>
                                    {resolvedComments.map((comment) => (
                                        <CommentCard
                                            key={comment._id}
                                            comment={comment}
                                            replies={getReplies(comment._id)}
                                            onReply={() => { }}
                                            onDelete={() => deleteComment(comment._id)}
                                            onResolve={() => toggleResolve(comment._id)}
                                            onReact={(emoji) => addReaction(comment._id, emoji)}
                                            isOwner={isOwner}
                                            replyingTo={replyingTo}
                                            replyContent={replyContent}
                                            setReplyContent={setReplyContent}
                                            onSubmitReply={() => { }}
                                            onCancelReply={() => { }}
                                            isResolved
                                        />
                                    ))}
                                </div>
                            )}

                            {comments.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No comments yet</p>
                                    <p className="text-xs">Start the conversation!</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* Collaborators Tab */}
                <TabsContent value="collaborators" className="flex-1 flex flex-col mt-0">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {/* Add Collaborator */}
                            {isOwner && (
                                <div className="space-y-2 p-3 rounded-lg border bg-muted/50">
                                    <h4 className="text-sm font-medium">Add Collaborator</h4>
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Email address"
                                            type="email"
                                            value={newCollaboratorEmail}
                                            onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                                        />
                                        <Select
                                            value={newCollaboratorPermission}
                                            onValueChange={(v: 'view' | 'comment' | 'edit') => setNewCollaboratorPermission(v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="view">Can view</SelectItem>
                                                <SelectItem value="comment">Can comment</SelectItem>
                                                <SelectItem value="edit">Can edit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            onClick={addCollaborator}
                                            disabled={!newCollaboratorEmail.trim() || isLoading}
                                            className="w-full"
                                            size="sm"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Collaborators List */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                    Collaborators
                                </h4>
                                {collaborators.map((collaborator) => {
                                    const Icon = PERMISSION_ICONS[collaborator.permission];
                                    return (
                                        <div
                                            key={collaborator._id}
                                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs bg-primary/10">
                                                    {collaborator.userName.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {collaborator.userName}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {collaborator.userEmail}
                                                </p>
                                            </div>
                                            {isOwner ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8">
                                                            <Icon className="h-4 w-4 mr-2" />
                                                            <span className="capitalize text-xs">
                                                                {collaborator.permission}
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {(['view', 'comment', 'edit'] as const).map((perm) => (
                                                            <DropdownMenuItem
                                                                key={perm}
                                                                onClick={() => updatePermission(collaborator.userId, perm)}
                                                                className="flex items-center gap-2"
                                                            >
                                                                {collaborator.permission === perm && (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                                <span className="capitalize">{perm}</span>
                                                            </DropdownMenuItem>
                                                        ))}
                                                        <DropdownMenuItem
                                                            onClick={() => removeCollaborator(collaborator.userId)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Remove
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Icon className="h-3 w-3 mr-1" />
                                                    {PERMISSION_LABELS[collaborator.permission]}
                                                </Badge>
                                            )}
                                        </div>
                                    );
                                })}

                                {collaborators.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No collaborators yet</p>
                                        {isOwner && (
                                            <p className="text-xs">Add people to collaborate</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Comment Card Component
interface CommentCardProps {
    comment: Comment;
    replies: Comment[];
    onReply: () => void;
    onDelete: () => void;
    onResolve: () => void;
    onReact: (emoji: string) => void;
    isOwner: boolean;
    replyingTo: string | null;
    replyContent: string;
    setReplyContent: (content: string) => void;
    onSubmitReply: () => void;
    onCancelReply: () => void;
    isResolved?: boolean;
}

function CommentCard({
    comment,
    replies,
    onReply,
    onDelete,
    onResolve,
    onReact,
    isOwner,
    replyingTo,
    replyContent,
    setReplyContent,
    onSubmitReply,
    onCancelReply,
    isResolved,
}: CommentCardProps) {
    const isReplying = replyingTo === comment._id;

    return (
        <div className={`p-3 rounded-lg border ${isResolved ? 'opacity-60 bg-muted/30' : 'bg-card'}`}>
            <div className="flex items-start gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-primary/10">
                        {comment.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {isResolved && (
                            <Badge variant="secondary" className="text-[10px]">
                                Resolved
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>

                    {/* Reactions */}
                    {comment.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {comment.reactions.map((reaction, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onReact(reaction.emoji)}
                                    className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full transition-colors"
                                >
                                    {reaction.emoji}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={onReply}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                            <Reply className="h-3 w-3" />
                            Reply
                        </button>
                        <button
                            onClick={() => onReact('👍')}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            <Smile className="h-3 w-3" />
                        </button>
                        {(isOwner || comment.userId === 'current-user-id') && (
                            <>
                                <button
                                    onClick={onResolve}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    {isResolved ? (
                                        <Circle className="h-3 w-3" />
                                    ) : (
                                        <CheckCircle2 className="h-3 w-3" />
                                    )}
                                    {isResolved ? 'Unresolve' : 'Resolve'}
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="text-xs text-destructive hover:text-destructive/80"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Reply Input */}
                    {isReplying && (
                        <div className="mt-3 space-y-2">
                            <Textarea
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="min-h-[60px] resize-none text-sm"
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={onCancelReply}>
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={onSubmitReply}
                                    disabled={!replyContent.trim()}
                                >
                                    Reply
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Replies */}
                    {replies.length > 0 && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-muted">
                            {replies.map((reply) => (
                                <div key={reply._id} className="flex items-start gap-2">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-[8px] bg-secondary/50">
                                            {reply.userName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium">{reply.userName}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs mt-0.5">{reply.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}