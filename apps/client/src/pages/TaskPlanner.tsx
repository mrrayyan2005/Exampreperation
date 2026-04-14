import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Bot, User, Sparkles, AlertCircle,
    Loader2, CheckCircle2, Copy, Terminal,
    BrainCircuit, Search, FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
const SyntaxHighlighterAny = SyntaxHighlighter as any;
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../api/axiosInstance';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Types
interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

const LoadingStep = ({ icon: Icon, label, isActive, isCompleted }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
            }`}
    >
        {isCompleted ? (
            <CheckCircle2 size={20} />
        ) : isActive ? (
            <Loader2 size={20} className="animate-spin" />
        ) : (
            <Icon size={20} />
        )}
        <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>{label}</span>
    </motion.div>
);

const TaskPlanner = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'streaming' | 'error' | 'offline'>('idle');
    const [debugInfo, setDebugInfo] = useState<any | null>(null);
    const [showDebug, setShowDebug] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastRequestRef = useRef<{ content: string; history: { role: string; content: string }[] } | null>(null);
    const streamAbortRef = useRef<AbortController | null>(null);
    const repoId = 'current-repo'; // Default or from context
    const quickPrompts = [
        'Build a 2-week revision plan for Physics',
        'Summarize calculus basics in bullet points',
        'Help me plan a daily 90-minute study routine',
        'Create a checklist for an upcoming exam'
    ];

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, loadingStep]);

    // Loading steps animation
    useEffect(() => {
        if (!isLoading) {
            setLoadingStep(0);
            return;
        }

        const steps = [0, 1, 2];
        let current = 0;

        const interval = setInterval(() => {
            current = (current + 1) % steps.length;
            setLoadingStep(current);
        }, 2500); // Change step every 2.5s

        return () => clearInterval(interval);
    }, [isLoading]);

    useEffect(() => {
        const updateOnlineStatus = () => {
            setConnectionStatus((prev) => (navigator.onLine ? (prev === 'offline' ? 'idle' : prev) : 'offline'));
        };

        updateOnlineStatus();
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    const getConnectionBadgeVariant = () => {
        switch (connectionStatus) {
            case 'connecting': return 'outline';
            case 'streaming': return 'default';
            case 'error': return 'destructive';
            case 'offline': return 'secondary';
            default: return 'secondary';
        }
    };

    const getConnectionBadgeLabel = () => {
        switch (connectionStatus) {
            case 'connecting': return 'Connecting';
            case 'streaming': return 'Streaming';
            case 'error': return 'Error';
            case 'offline': return 'Offline';
            default: return 'Idle';
        }
    };

    const updateAssistantMessage = (assistantMessageId: number, content: string) => {
        setMessages(prev => prev.map(msg => (msg.timestamp === assistantMessageId ? { ...msg, content } : msg)));
    };

    const runStreamRequest = async (messageContent: string, historyOverride?: { role: string; content: string }[]) => {
        if (!messageContent.trim() || isLoading) return;

        if (!navigator.onLine) {
            setError('You appear to be offline. Please reconnect and try again.');
            setConnectionStatus('offline');
            return;
        }

        const userMessage: Message = {
            role: 'user',
            content: messageContent.trim(),
            timestamp: Date.now()
        };

        const assistantMessageId = Date.now() + 1;
        setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '', timestamp: assistantMessageId }]);
        setInput('');
        setIsLoading(true);
        setError(null);
        setDebugInfo(null);
        setShowDebug(false);
        setConnectionStatus('connecting');

        const history = historyOverride || messages.map(m => ({ role: m.role, content: m.content }));
        lastRequestRef.current = { content: userMessage.content, history };

        if (streamAbortRef.current) {
            streamAbortRef.current.abort();
        }

        const controller = new AbortController();
        streamAbortRef.current = controller;
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        let assistantContent = '';
        let parseErrors = 0;
        let streamCompleted = false;
        let didStartStreaming = false;

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Missing authentication token. Please log in again.');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/planner/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    taskDescription: userMessage.content,
                    repoId: repoId,
                    history
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || 'Stream failed';
                setDebugInfo({
                    status: response.status,
                    errorType: errorData?.error,
                    suggestion: errorData?.suggestion,
                    details: errorData?.details
                });
                throw new Error(errorMessage);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No stream reader available');

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const events = buffer.split('\n\n');
                buffer = events.pop() || '';

                for (const event of events) {
                    const lines = event.split('\n').filter(line => line.startsWith('data:'));
                    if (lines.length === 0) continue;

                    const payload = lines.map(line => line.replace(/^data:\s?/, '')).join('\n');
                    if (!payload || payload === '[DONE]') continue;

                    try {
                        const data = JSON.parse(payload);

                        if (data.type === 'error' || data.error) {
                            setDebugInfo({
                                errorType: data.errorType,
                                suggestion: data.suggestion,
                                details: data.details,
                                parseErrors
                            });
                            throw new Error(data.error || 'Streaming failed');
                        }

                        if (data.type === 'done' || data.done) {
                            streamCompleted = true;
                            break;
                        }

                        const delta = data.content || data.token;
                        if (delta) {
                            if (!didStartStreaming) {
                                didStartStreaming = true;
                                setConnectionStatus('streaming');
                            }
                            assistantContent += delta;
                            updateAssistantMessage(assistantMessageId, assistantContent);
                        }
                    } catch (parseError) {
                        parseErrors += 1;
                    }
                }

                if (streamCompleted) break;
            }

            if (!assistantContent.trim() && !streamCompleted) {
                setDebugInfo({ parseErrors, note: 'Stream ended without response content.' });
                throw new Error('Stream ended without a response. Please retry.');
            }

            setConnectionStatus('idle');
        } catch (err: any) {
            if (err?.name === 'AbortError') {
                setError('The request timed out. Please retry.');
                setConnectionStatus('error');
                setDebugInfo(prev => ({ ...(prev || {}), note: 'Client-side timeout after 45s.' }));
            } else {
                setError(err.message || 'Something went wrong');
                setConnectionStatus('error');
            }
        } finally {
            clearTimeout(timeoutId);
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        await runStreamRequest(input);
    };

    const handleRetry = async () => {
        if (!lastRequestRef.current) return;
        await runStreamRequest(lastRequestRef.current.content, lastRequestRef.current.history);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Action Handlers
    const handleSaveNote = async (title: string, content: string) => {
        try {
            const noteData = {
                title: title,
                content: {
                    blocks: [
                        { id: Date.now().toString(), type: 'text', content: content }
                    ]
                },
                tags: ['Generated']
            };

            await api.post('/notes', noteData);
            toast.success("Note saved successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save note");
        }
    };

    const parseMessageContent = (content: string) => {
        let displayContent = content;
        const actions: any[] = [];

        const noteMatch = /<note title="(.*?)">([\s\S]*?)<\/note>/g.exec(content);
        if (noteMatch) {
            displayContent = content.replace(noteMatch[0], '').trim();
            actions.push({
                type: 'note',
                title: noteMatch[1],
                content: noteMatch[2].trim()
            });
        }

        return { displayContent, actions };
    };

    return (
        <div className="flex flex-col h-[calc(100dvh-73px)] lg:h-[calc(100dvh-73px)] bg-background text-foreground">


            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
                <div className="max-w-5xl mx-auto space-y-6 pb-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-6 relative">
                                <Sparkles size={40} className="text-primary" />
                            </div>
                            <h3 className="text-3xl font-semibold mb-3 tracking-tight">Ready to map your next study win?</h3>
                            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                                I can build daily routines, prep timelines, or quick summaries. Start with a question or choose a prompt below.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-8 justify-center max-w-2xl">
                                {quickPrompts.map((prompt) => (
                                    <Button
                                        key={prompt}
                                        variant="outline"
                                        className="rounded-full bg-background"
                                        onClick={() => runStreamRequest(prompt)}
                                    >
                                        {prompt}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {messages.map((msg, idx) => {
                            const { displayContent, actions } = msg.role === 'assistant' ? parseMessageContent(msg.content) : { displayContent: msg.content, actions: [] };

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border
                                        ${msg.role === 'user' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground border-border'}`}>
                                        {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`flex flex-col gap-2 max-w-[85%]`}>
                                        <div className={`rounded-2xl p-5 shadow-sm
                                            ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-card border border-border text-card-foreground rounded-tl-none'
                                            }`}>
                                            {msg.role === 'assistant' ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown
                                                        components={{
                                                            code({ node, inline, className, children, ...props }: any) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                return !inline && match ? (
                                                                    <div className="relative group rounded-md overflow-hidden my-3 border border-border">
                                                                        <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <div className="flex items-center gap-1 bg-muted rounded px-2 py-1">
                                                                                <span className="text-[10px] font-mono text-muted-foreground uppercase">{match[1]}</span>
                                                                            </div>
                                                                        </div>
                                                                        <SyntaxHighlighterAny
                                                                            style={vscDarkPlus}
                                                                            language={match[1]}
                                                                            PreTag="div"
                                                                            customStyle={{ margin: 0, padding: '1.5rem', background: '#1e1e1e' }}
                                                                            {...props}
                                                                        >
                                                                            {String(children).replace(/\n$/, '')}
                                                                        </SyntaxHighlighterAny>
                                                                    </div>
                                                                ) : (
                                                                    <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        {displayContent}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        {msg.role === 'assistant' && actions && actions.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                {actions.map((action: any, i: number) => (
                                                    <React.Fragment key={i}>
                                                        {action.type === 'note' && (
                                                            <Button
                                                                key={`btn-note-${i}`}
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSaveNote(action.title, action.content)}
                                                                className="gap-2 rounded-xl"
                                                            >
                                                                <FileText size={16} />
                                                                Save as Note
                                                            </Button>
                                                        )}

                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Loading Indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4"
                        >
                            <div className="w-10 h-10 rounded-full border border-border bg-card text-primary flex items-center justify-center shadow-sm animate-pulse">
                                <Bot size={18} />
                            </div>
                            <div className="bg-card border border-border rounded-2xl rounded-tl-none p-4 shadow-sm flex flex-col gap-2 min-w-[280px]">
                                <LoadingStep
                                    icon={Search}
                                    label="Analyzing Study Habits..."
                                    isActive={loadingStep === 0}
                                    isCompleted={loadingStep > 0}
                                />
                                <LoadingStep
                                    icon={BrainCircuit}
                                    label="Checking Upcoming Exams..."
                                    isActive={loadingStep === 1}
                                    isCompleted={loadingStep > 1}
                                />
                                <LoadingStep
                                    icon={Sparkles}
                                    label="Creating Study Plan..."
                                    isActive={loadingStep === 2}
                                    isCompleted={loadingStep > 2}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-center"
                        >
                            <div className="bg-destructive/10 text-destructive px-4 py-4 rounded-2xl flex items-start gap-3 border border-destructive/20 shadow-sm max-w-md">
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Unable to generate plan</p>
                                    <p className="opacity-90 mt-1 text-sm">{error}</p>
                                    {debugInfo?.suggestion && (
                                        <p className="text-xs mt-2 border-t border-destructive/20 pt-2">
                                            Suggestion: {debugInfo.suggestion}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRetry}
                                            className="h-7 text-xs border-destructive/30 hover:bg-destructive/10 text-destructive hover:text-destructive"
                                        >
                                            Retry
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDebug(prev => !prev)}
                                            className="h-7 text-xs gap-1 hover:bg-destructive/10 text-destructive hover:text-destructive"
                                        >
                                            <Terminal size={12} />
                                            {showDebug ? 'Hide Details' : 'Show Details'}
                                        </Button>
                                    </div>
                                    {showDebug && debugInfo && (
                                        <div className="mt-3 text-[11px] bg-background/50 rounded-md p-3 border border-destructive/20 font-mono">
                                            <div className="grid grid-cols-[80px_1fr] gap-1">
                                                <span className="opacity-70">Status:</span> <span>{debugInfo.status || 'n/a'}</span>
                                                <span className="opacity-70">Error:</span> <span>{debugInfo.errorType || 'n/a'}</span>
                                                <span className="opacity-70">Suggestion:</span> <span>{debugInfo.suggestion || 'n/a'}</span>
                                                <span className="opacity-70">Parse Errs:</span> <span>{debugInfo.parseErrors ?? 0}</span>
                                                {debugInfo.note && <><span className="opacity-70">Note:</span> <span>{debugInfo.note}</span></>}
                                            </div>
                                            {debugInfo.details && <div className="mt-2 text-muted-foreground break-all">{JSON.stringify(debugInfo.details)}</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-none p-4 md:px-6 md:py-5 bg-background border-t z-20 sticky bottom-0">
                <div className="max-w-5xl mx-auto relative group">
                    <div className="relative flex items-end overflow-hidden rounded-2xl border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-shadow">
                        <Textarea
                            placeholder="Ask about your studies... (Shift+Enter for new line)"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="min-h-[60px] max-h-[200px] w-full resize-none border-0 bg-transparent py-4 pl-4 pr-16 focus-visible:ring-0 shadow-none"
                            rows={1}
                        />
                        <div className="absolute right-3 bottom-3">
                            <Button
                                size="icon"
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isLoading}
                                className={`rounded-full h-10 w-10 transition-transform flex items-center justify-center ${input.trim() ? "scale-105 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted"}`}
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={input.trim() ? 'translate-x-[1px]' : ''} />}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="max-w-5xl mx-auto flex flex-col items-center sm:flex-row sm:justify-between text-[11px] text-muted-foreground mt-3 px-2">
                    <span>AI can make mistakes. Review plans before acting.</span>
                </div>
            </div>
        </div>
    );
};

export default TaskPlanner;
