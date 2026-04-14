import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, MessageCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import axiosInstance from '@/api/axiosInstance';
import { format } from 'date-fns';
import ThreadView from './ThreadView';

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

interface ChatWindowProps {
    groupId: string;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatWindow = ({ groupId }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeThread, setActiveThread] = useState<Message | null>(null);
    const user = useAppSelector((state) => state.auth.user) as any;

    // Initialize Socket connection
    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            withCredentials: true
        });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            socketRef.current?.emit('join_group', groupId);
        });

        socketRef.current.on('receive_message', (message: any) => {
            // Optimistically add message if it's from others, or update existing if needed
            // For simplicity, we just append. In a real app, we'd handle deduplication.
            console.log('Received message:', message);

            // If we are the sender, the message might already be added optimistically
            // But since we just broadcast, we can just append
            setMessages((prev) => [...prev, {
                _id: message._id || Date.now().toString(), // Temp ID if needed
                content: message.content,
                sender: {
                    _id: message.senderId,
                    name: message.senderName,
                    avatar: message.senderAvatar
                },
                createdAt: message.createdAt
            }]);
        });

        return () => {
            socketRef.current?.emit('leave_group', groupId);
            socketRef.current?.disconnect();
        };
    }, [groupId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Fetch historical messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axiosInstance.get(`/groups/${groupId}/messages`);
                setMessages(response.data.data);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (groupId) {
            fetchMessages();
        }
    }, [groupId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !socketRef.current) return;

        const messageData = {
            groupId,
            content: newMessage,
            senderId: user._id,
            senderName: user.name,
            senderAvatar: user.avatar
        };

        // Emit to socket
        socketRef.current.emit('send_message', messageData);

        // Also persist via API for reliability (optional if socket handles it, but good for hybrid)
        try {
            await axiosInstance.post(`/groups/${groupId}/messages`, {
                content: newMessage
            });
        } catch (error) {
            console.error('Failed to save message:', error);
        }

        setNewMessage('');
    };

    return (
        <div className="flex h-[600px] border rounded-lg bg-background shadow-sm overflow-hidden">
            <div className={`flex flex-col h-full flex-1 ${activeThread ? 'hidden md:flex' : ''}`}>
                <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-semibold flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        Group Chat
                    </h3>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <span className="loading loading-spinner loading-md"></span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground py-10">
                                    No messages yet. Start the conversation!
                                </div>
                            )}
                            {messages.map((msg, index) => {
                                const isCurrentUser = msg.sender._id === user?._id;

                                return (
                                    <div
                                        key={msg._id || index}
                                        className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.sender.avatar} />
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>

                                        <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {msg.sender.name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/70">
                                                    {format(new Date(msg.createdAt), 'HH:mm')}
                                                </span>
                                            </div>
                                            <div className="relative group">
                                                <div
                                                    className={`p-3 rounded-lg text-sm ${isCurrentUser
                                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                        : 'bg-muted rounded-tl-none'
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`absolute top-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${isCurrentUser ? '-left-8' : '-right-8'
                                                        }`}
                                                    onClick={() => setActiveThread(msg)}
                                                    title="Reply in thread"
                                                >
                                                    <MessageCircle className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/10">
                    <div className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim() || !isConnected}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </div>

            {activeThread && (
                <div className="w-full md:w-[350px] border-l h-full">
                    <ThreadView
                        groupId={groupId}
                        parentMessage={activeThread}
                        onClose={() => setActiveThread(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
