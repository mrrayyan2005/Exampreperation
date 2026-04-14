import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, X, ArrowLeft } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import axiosInstance from '@/api/axiosInstance';
import { format } from 'date-fns';

interface Message {
    _id: string;
    content: string;
    sender: {
        _id: string;
        name: string;
        avatar?: string;
    };
    createdAt: string;
}

interface ThreadViewProps {
    groupId: string;
    parentMessage: Message;
    onClose: () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ThreadView = ({ groupId, parentMessage, onClose }: ThreadViewProps) => {
    const [replies, setReplies] = useState<Message[]>([]);
    const [newReply, setNewReply] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const user = useAppSelector((state) => state.auth.user) as any;

    // Fetch thread messages
    useEffect(() => {
        const fetchReplies = async () => {
            try {
                const response = await axiosInstance.get(
                    `/groups/${groupId}/messages/${parentMessage._id}/thread`
                );
                setReplies(response.data.data.replies);
            } catch (error) {
                console.error('Failed to fetch thread replies:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (parentMessage._id) {
            fetchReplies();
        }
    }, [groupId, parentMessage._id]);

    // Socket connection for real-time updates in thread
    // Note: ideally we'd join a specific thread room or filter messages by parentMessageId
    // For MVP, we can reuse the group socket and filter client-side if we receive all messages
    // OR we can trust that the main ChatWindow handles the socket connection and we just need
    // to listen to an event or refetch. 
    // 
    // Let's reuse the socket connection logic but specifically listen for replies to this thread.
    // Actually, creating a new socket connection might be overkill. 
    // A better approach would be to pass the socket instance from ChatWindow, but for isolation let's 
    // just implement a lightweight listener or simple polling/optimistic UI for now to avoid complexity.
    // 
    // Wait, if we use the SAME socket event 'receive_message', we can check if it belongs to this thread.

    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            withCredentials: true
        });

        socketRef.current.on('connect', () => {
            socketRef.current?.emit('join_group', groupId);
        });

        socketRef.current.on('receive_message', (message: any) => {
            if (message.parentMessage === parentMessage._id) {
                setReplies((prev) => [...prev, {
                    _id: message._id || Date.now().toString(),
                    content: message.content,
                    sender: {
                        _id: message.senderId,
                        name: message.senderName,
                        avatar: message.senderAvatar
                    },
                    createdAt: message.createdAt
                }]);
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [groupId, parentMessage._id]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [replies]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || !user || !socketRef.current) return;

        const messageData = {
            groupId,
            content: newReply,
            senderId: user._id,
            senderName: user.name,
            senderAvatar: user.avatar,
            parentMessage: parentMessage._id
        };

        // Emit to socket
        socketRef.current.emit('send_message', messageData);

        // Persist via API
        try {
            await axiosInstance.post(`/groups/${groupId}/messages`, {
                content: newReply,
                parentMessage: parentMessage._id
            });
        } catch (error) {
            console.error('Failed to save reply:', error);
        }

        setNewReply('');
    };

    return (
        <div className="flex flex-col h-full bg-background border-l border-border shadow-xl">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-semibold">Thread</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-4 bg-muted/10 border-b">
                <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={parentMessage.sender.avatar} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                                {parentMessage.sender.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground/70">
                                {format(new Date(parentMessage.createdAt), 'HH:mm')}
                            </span>
                        </div>
                        <div className="text-sm bg-background p-2 rounded-md border">
                            {parentMessage.content}
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <span className="loading loading-spinner loading-md"></span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {replies.map((msg, index) => {
                            const isCurrentUser = msg.sender._id === user?._id;
                            return (
                                <div
                                    key={msg._id || index}
                                    className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                                >
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={msg.sender.avatar} />
                                        <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                                    </Avatar>

                                    <div className={`flex flex-col max-w-[85%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                {msg.sender.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/70">
                                                {format(new Date(msg.createdAt), 'HH:mm')}
                                            </span>
                                        </div>
                                        <div
                                            className={`p-2 rounded-lg text-sm ${isCurrentUser
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-muted rounded-tl-none'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            <form onSubmit={handleSendReply} className="p-4 border-t bg-muted/10">
                <div className="flex gap-2">
                    <Input
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Reply to thread..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newReply.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ThreadView;
