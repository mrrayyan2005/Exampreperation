import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Chip,
    Avatar,
    Fade,
    Tooltip,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Send,
    AutoAwesome,
    Close,
    Minimize,
    OpenInFull,
    ContentCopy,
    CheckCircle,
    Psychology,
    Refresh,
} from '@mui/icons-material';
import axiosInstance from '@/api/axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    actionsTaken?: Array<{ tool: string; description: string; result: any }>;
}

interface CopilotResponse {
    success: boolean;
    data: {
        message: string;
        actionsTaken: Array<{ tool: string; description: string; result: any }>;
        suggestions?: string[];
        conversationId: string;
    };
}

interface SuggestionItem {
    type: 'urgent' | 'nudge' | 'tip' | 'achievement';
    title: string;
    description: string;
    action?: { label: string; prompt: string };
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Heading
        if (line.startsWith('### ')) {
            elements.push(
                <Typography key={i} variant="subtitle2" sx={{ fontWeight: 700, mt: 1, mb: 0.5, color: 'primary.main' }}>
                    {line.slice(4)}
                </Typography>
            );
        } else if (line.startsWith('## ')) {
            elements.push(
                <Typography key={i} variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
                    {line.slice(3)}
                </Typography>
            );
        } else if (line.startsWith('**') && line.endsWith('**')) {
            elements.push(
                <Typography key={i} variant="body2" sx={{ fontWeight: 700, display: 'inline' }}>
                    {line.slice(2, -2)}
                </Typography>
            );
        } else if (line.startsWith('- ') || line.startsWith('• ')) {
            elements.push(
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, my: 0.25 }}>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main', mt: 1, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {renderInlineMarkdown(line.slice(2))}
                    </Typography>
                </Box>
            );
        } else if (line.trim() === '') {
            elements.push(<Box key={i} sx={{ height: 6 }} />);
        } else {
            elements.push(
                <Typography key={i} variant="body2" sx={{ lineHeight: 1.7 }}>
                    {renderInlineMarkdown(line)}
                </Typography>
            );
        }
        i++;
    }

    return <>{elements}</>;
}

function renderInlineMarkdown(text: string): React.ReactNode {
    // Bold: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </>
    );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5 }}>
            {[0, 1, 2].map((i) => (
                <Box
                    key={i}
                    sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        opacity: 0.7,
                        animation: 'bounce 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                        '@keyframes bounce': {
                            '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
                            '40%': { transform: 'scale(1)', opacity: 1 },
                        },
                    }}
                />
            ))}
        </Box>
    );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Fade in timeout={300}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 2,
                    '&:hover .copy-btn': { opacity: 1 },
                }}
            >
                {/* Avatar */}
                {!isUser && (
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            flexShrink: 0,
                            mt: 0.5,
                        }}
                    >
                        <Psychology sx={{ fontSize: 18 }} />
                    </Avatar>
                )}

                {/* Bubble */}
                <Box sx={{ maxWidth: '80%', position: 'relative' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isUser
                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                : 'rgba(255,255,255,0.06)',
                            border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            color: isUser ? '#fff' : 'text.primary',
                        }}
                    >
                        {isUser ? (
                            <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#fff' }}>
                                {message.content}
                            </Typography>
                        ) : (
                            renderMarkdown(message.content)
                        )}
                    </Paper>

                    {/* Actions taken */}
                    {message.actionsTaken && message.actionsTaken.length > 0 && (
                        <Box sx={{ mt: 0.75, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {message.actionsTaken.map((action, i) => (
                                <Chip
                                    key={i}
                                    label={action.description}
                                    size="small"
                                    icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                                    sx={{
                                        fontSize: '0.68rem',
                                        height: 22,
                                        bgcolor: 'rgba(34, 197, 94, 0.12)',
                                        color: '#22c55e',
                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                        '& .MuiChip-icon': { color: '#22c55e' },
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Timestamp + copy */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isUser ? 'flex-end' : 'flex-start',
                            gap: 0.5,
                            mt: 0.5,
                        }}
                    >
                        <Typography variant="caption" sx={{ opacity: 0.4, fontSize: '0.65rem' }}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        {!isUser && (
                            <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                                <IconButton
                                    className="copy-btn"
                                    size="small"
                                    onClick={handleCopy}
                                    sx={{ opacity: 0, transition: 'opacity 0.2s', p: 0.25 }}
                                >
                                    {copied ? (
                                        <CheckCircle sx={{ fontSize: 12, color: '#22c55e' }} />
                                    ) : (
                                        <ContentCopy sx={{ fontSize: 12, opacity: 0.5 }} />
                                    )}
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            </Box>
        </Fade>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface StudyCopilotProps {
    onClose?: () => void;
    defaultOpen?: boolean;
}

export default function StudyCopilot({ onClose, defaultOpen = true }: StudyCopilotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | undefined>();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [proactiveSuggestions, setProactiveSuggestions] = useState<SuggestionItem[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Load proactive suggestions on mount
    useEffect(() => {
        fetchProactiveSuggestions();
    }, []);

    const fetchProactiveSuggestions = async () => {
        try {
            const res = await axiosInstance.get('/copilot/suggestions');
            if (res.data?.success) {
                setProactiveSuggestions(res.data.data || []);
            }
        } catch {
            // Silently fail
        }
    };

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setShowWelcome(false);
        setSuggestions([]);

        try {
            const res = await axiosInstance.post<CopilotResponse>('/copilot/chat', {
                message: text.trim(),
                conversationId,
            });

            if (res.data?.success && res.data.data) {
                const { message, actionsTaken, suggestions: newSuggestions, conversationId: newConvId } = res.data.data;

                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: message,
                    timestamp: new Date(),
                    actionsTaken: actionsTaken?.filter((a) => !a.result?.error),
                };

                setMessages((prev) => [...prev, assistantMessage]);
                if (newConvId) setConversationId(newConvId);
                if (newSuggestions?.length) setSuggestions(newSuggestions);
            }
        } catch (error: any) {
            const errMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errMessage]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isLoading, conversationId]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleReset = () => {
        setMessages([]);
        setConversationId(undefined);
        setSuggestions([]);
        setShowWelcome(true);
        fetchProactiveSuggestions();
    };

    const quickPrompts = [
        "What should I study today?",
        "Show my upcoming exams",
        "How many hours did I study this week?",
        "Help me prioritize my tasks",
    ];

    const suggestionTypeColor: Record<string, string> = {
        urgent: '#ef4444',
        nudge: '#f59e0b',
        tip: '#6366f1',
        achievement: '#22c55e',
    };

    return (
        <Paper
            elevation={24}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: isExpanded ? 520 : 400,
                height: isExpanded ? 700 : 580,
                borderRadius: 3,
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #0f0f1a 0%, #12121f 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            {/* ── Header ── */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                {/* Logo */}
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                    }}
                >
                    <AutoAwesome sx={{ fontSize: 20, color: '#fff' }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        Study Copilot
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.65rem' }}>
                        AI-powered study assistant
                    </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="New conversation">
                        <IconButton size="small" onClick={handleReset} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                            <Refresh sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={isExpanded ? 'Minimize' : 'Expand'}>
                        <IconButton
                            size="small"
                            onClick={() => setIsExpanded((v) => !v)}
                            sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                        >
                            {isExpanded ? <Minimize sx={{ fontSize: 16 }} /> : <OpenInFull sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Tooltip>
                    {onClose && (
                        <Tooltip title="Close">
                            <IconButton size="small" onClick={onClose} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                                <Close sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            {/* ── Messages ── */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    px: 2,
                    py: 2,
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 2 },
                }}
            >
                {/* Welcome state */}
                {showWelcome && messages.length === 0 && (
                    <Fade in timeout={500}>
                        <Box>
                            {/* Greeting */}
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 1.5,
                                        boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                                    }}
                                >
                                    <AutoAwesome sx={{ fontSize: 28, color: '#fff' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    Hi! I'm your Study Copilot
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.5, fontSize: '0.8rem' }}>
                                    I know your tasks, exams, and study history. Ask me anything!
                                </Typography>
                            </Box>

                            {/* Proactive suggestions */}
                            {proactiveSuggestions.length > 0 && (
                                <Box sx={{ mb: 2.5 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.4, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem' }}>
                                        Insights for you
                                    </Typography>
                                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {proactiveSuggestions.slice(0, 3).map((s, i) => (
                                            <Paper
                                                key={i}
                                                elevation={0}
                                                onClick={() => s.action && sendMessage(s.action.prompt)}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: `1px solid ${suggestionTypeColor[s.type]}30`,
                                                    cursor: s.action ? 'pointer' : 'default',
                                                    transition: 'all 0.2s',
                                                    '&:hover': s.action ? {
                                                        background: 'rgba(255,255,255,0.07)',
                                                        borderColor: `${suggestionTypeColor[s.type]}60`,
                                                    } : {},
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: '50%',
                                                            bgcolor: suggestionTypeColor[s.type],
                                                            mt: 0.75,
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: suggestionTypeColor[s.type] }}>
                                                            {s.title}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.6, mt: 0.25, fontSize: '0.7rem' }}>
                                                            {s.description}
                                                        </Typography>
                                                        {s.action && (
                                                            <Typography variant="caption" sx={{ color: 'primary.main', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                                                                → {s.action.label}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Quick prompts */}
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.4, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem' }}>
                                    Quick questions
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                    {quickPrompts.map((prompt, i) => (
                                        <Chip
                                            key={i}
                                            label={prompt}
                                            size="small"
                                            onClick={() => sendMessage(prompt)}
                                            sx={{
                                                fontSize: '0.72rem',
                                                height: 28,
                                                cursor: 'pointer',
                                                bgcolor: 'rgba(99,102,241,0.1)',
                                                border: '1px solid rgba(99,102,241,0.2)',
                                                color: 'text.secondary',
                                                '&:hover': { bgcolor: 'rgba(99,102,241,0.2)', color: 'text.primary' },
                                                transition: 'all 0.2s',
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                )}

                {/* Messages */}
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Typing indicator */}
                {isLoading && (
                    <Fade in timeout={200}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                }}
                            >
                                <Psychology sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Paper
                                elevation={0}
                                sx={{
                                    px: 2,
                                    py: 1,
                                    borderRadius: '18px 18px 18px 4px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <TypingIndicator />
                            </Paper>
                        </Box>
                    </Fade>
                )}

                <div ref={messagesEndRef} />
            </Box>

            {/* ── Suggestions ── */}
            {suggestions.length > 0 && !isLoading && (
                <Box
                    sx={{
                        px: 2,
                        pb: 1,
                        display: 'flex',
                        gap: 0.75,
                        flexWrap: 'wrap',
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                        pt: 1,
                    }}
                >
                    {suggestions.slice(0, 3).map((s, i) => (
                        <Chip
                            key={i}
                            label={s}
                            size="small"
                            onClick={() => sendMessage(s)}
                            sx={{
                                fontSize: '0.7rem',
                                height: 26,
                                cursor: 'pointer',
                                bgcolor: 'rgba(99,102,241,0.08)',
                                border: '1px solid rgba(99,102,241,0.15)',
                                color: 'text.secondary',
                                '&:hover': { bgcolor: 'rgba(99,102,241,0.18)', color: 'text.primary' },
                                transition: 'all 0.2s',
                            }}
                        />
                    ))}
                </Box>
            )}

            {/* ── Input ── */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 1,
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 2.5,
                        border: '1px solid rgba(255,255,255,0.08)',
                        px: 1.5,
                        py: 0.75,
                        transition: 'border-color 0.2s',
                        '&:focus-within': { borderColor: 'rgba(99,102,241,0.4)' },
                    }}
                >
                    <TextField
                        inputRef={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything about your studies..."
                        multiline
                        maxRows={4}
                        variant="standard"
                        fullWidth
                        disabled={isLoading}
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '0.85rem', lineHeight: 1.5 },
                        }}
                        sx={{
                            '& .MuiInputBase-root': { p: 0 },
                        }}
                    />
                    <IconButton
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        size="small"
                        sx={{
                            width: 34,
                            height: 34,
                            background: input.trim() && !isLoading
                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                : 'rgba(255,255,255,0.06)',
                            borderRadius: 1.5,
                            flexShrink: 0,
                            transition: 'all 0.2s',
                            '&:hover': {
                                background: input.trim() && !isLoading
                                    ? 'linear-gradient(135deg, #5254cc 0%, #7c3aed 100%)'
                                    : 'rgba(255,255,255,0.1)',
                            },
                            '&.Mui-disabled': { background: 'rgba(255,255,255,0.04)' },
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress size={14} sx={{ color: 'rgba(255,255,255,0.4)' }} />
                        ) : (
                            <Send sx={{ fontSize: 16, color: input.trim() ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                        )}
                    </IconButton>
                </Box>

                <Typography
                    variant="caption"
                    sx={{ display: 'block', textAlign: 'center', mt: 0.75, opacity: 0.25, fontSize: '0.6rem' }}
                >
                    Press Enter to send · Shift+Enter for new line
                </Typography>
            </Box>
        </Paper>
    );
}
