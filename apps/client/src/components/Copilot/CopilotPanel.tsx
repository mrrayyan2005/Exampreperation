import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, ChevronDown, Zap, AlertTriangle, Lightbulb, Trophy } from 'lucide-react';
import { copilotApi, CopilotMessage, ProactiveSuggestion } from '@/api/copilotApi';
import { motion, AnimatePresence } from 'framer-motion';

const CopilotPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<CopilotMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm **StudyPilot** 🚀 — your AI study assistant. I can help you:\n\n• Create tasks & study schedules\n• Generate practice tests\n• Track your progress\n• Plan for upcoming exams\n\nTry asking me something like *\"I have a Physics exam on Friday, help me prepare\"*",
            timestamp: new Date(),
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | undefined>();
    const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load suggestions when panel opens
    useEffect(() => {
        if (isOpen) {
            loadSuggestions();
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const loadSuggestions = async () => {
        try {
            const data = await copilotApi.getSuggestions();
            setSuggestions(data);
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        }
    };

    const handleSend = useCallback(async (messageText?: string) => {
        const text = messageText || input;
        if (!text.trim() || loading) return;

        const userMsg: CopilotMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setShowSuggestions(false);

        // Add a streaming placeholder message
        const streamingId = (Date.now() + 1).toString();
        setMessages((prev) => [
            ...prev,
            { id: streamingId, role: 'assistant', content: '', timestamp: new Date() },
        ]);

        try {
            const token = localStorage.getItem('authToken') || '';
            const response = await fetch('/ai/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text, conversationId, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`Stream request failed: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const event = JSON.parse(line.slice(6));
                        if (event.type === 'token') {
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.id === streamingId
                                        ? { ...m, content: m.content + event.token }
                                        : m
                                )
                            );
                        } else if (event.type === 'done') {
                            if (event.conversationId) setConversationId(event.conversationId);
                            if (event.suggestions?.length) {
                                setSuggestions(
                                    event.suggestions.map((s: string, i: number) => ({
                                        id: `sug-${i}`,
                                        type: 'tip' as const,
                                        message: s,
                                        action: s,
                                    }))
                                );
                                setShowSuggestions(true);
                            }
                        } else if (event.type === 'error') {
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.id === streamingId
                                        ? { ...m, content: `⚠️ ${event.message}` }
                                        : m
                                )
                            );
                        }
                    } catch {
                        // skip malformed SSE lines
                    }
                }
            }
        } catch (error) {
            console.error('Copilot streaming error:', error);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === streamingId
                        ? { ...m, content: "Sorry, I'm having trouble right now. Please try again in a moment." }
                        : m
                )
            );
        } finally {
            setLoading(false);
        }
    }, [input, loading, conversationId]);


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getSuggestionIcon = (type: ProactiveSuggestion['type']) => {
        switch (type) {
            case 'urgent': return <AlertTriangle className="h-3.5 w-3.5 text-red-400" />;
            case 'nudge': return <Zap className="h-3.5 w-3.5 text-yellow-400" />;
            case 'tip': return <Lightbulb className="h-3.5 w-3.5 text-blue-400" />;
            case 'achievement': return <Trophy className="h-3.5 w-3.5 text-green-400" />;
        }
    };

    const getSuggestionBorderColor = (type: ProactiveSuggestion['type']) => {
        switch (type) {
            case 'urgent': return 'border-red-500/30 hover:border-red-500/60';
            case 'nudge': return 'border-yellow-500/30 hover:border-yellow-500/60';
            case 'tip': return 'border-blue-500/30 hover:border-blue-500/60';
            case 'achievement': return 'border-green-500/30 hover:border-green-500/60';
        }
    };

    // Simple markdown-like rendering for bold and italic
    const renderContent = (content: string) => {
        return content.split('\n').map((line, i) => {
            // Bold: **text**
            let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Italic: *text*
            processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
            // Bullet points
            if (processed.startsWith('• ') || processed.startsWith('- ')) {
                return (
                    <div key={i} className="flex gap-1.5 ml-1 mb-0.5">
                        <span className="text-primary/70 mt-0.5">•</span>
                        <span dangerouslySetInnerHTML={{ __html: processed.substring(2) }} />
                    </div>
                );
            }
            return (
                <div key={i}>
                    <span dangerouslySetInnerHTML={{ __html: processed }} />
                    {i < content.split('\n').length - 1 && processed === '' && <br />}
                </div>
            );
        });
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all duration-200 flex items-center justify-center group"
                        aria-label="Open StudyPilot"
                    >
                        <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                        {suggestions.some((s) => s.type === 'urgent') && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-white/10 flex flex-col bg-gradient-to-b from-gray-900 to-gray-950"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600/90 to-indigo-600/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Sparkles className="h-4.5 w-4.5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm leading-tight">Study Copilot</h3>
                                    <p className="text-white/60 text-[10px]">AI Study Assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Suggestions Bar */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="px-3 py-2 border-b border-white/5 bg-white/[0.02] shrink-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Suggestions</span>
                                    <button
                                        onClick={() => setShowSuggestions(false)}
                                        className="text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                                    {suggestions.slice(0, 3).map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => s.action && handleSend(s.action.prompt)}
                                            className={`text-left px-2.5 py-1.5 rounded-lg border ${getSuggestionBorderColor(s.type)} bg-white/[0.03] transition-all duration-150 group/suggestion`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {getSuggestionIcon(s.type)}
                                                <div className="min-w-0">
                                                    <p className="text-white/80 text-[11px] font-medium truncate">{s.title}</p>
                                                    {s.action && (
                                                        <p className="text-white/40 text-[10px] mt-0.5 group-hover/suggestion:text-violet-400 transition-colors">
                                                            {s.action.label} →
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.role === 'user'
                                            ? 'bg-violet-600 text-white rounded-br-md'
                                            : 'bg-white/[0.07] text-white/90 rounded-bl-md border border-white/5'
                                            }`}
                                    >
                                        {/* Show action badges for assistant messages */}
                                        {msg.role === 'assistant' && msg.actionsTaken && msg.actionsTaken.length > 0 && (
                                            <div className="mb-2 space-y-1">
                                                {msg.actionsTaken.map((action, i) => (
                                                    <div
                                                        key={i}
                                                        className={`text-[11px] px-2 py-1 rounded-md ${action.result?.error
                                                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                            }`}
                                                    >
                                                        {action.result?.error ? '❌' : '✅'} {action.description}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div>{renderContent(msg.content)}</div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/[0.07] rounded-2xl rounded-bl-md px-4 py-3 border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-3.5 w-3.5 text-violet-400 animate-spin" />
                                            <span className="text-white/50 text-[12px]">StudyPilot is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-3 py-3 border-t border-white/5 bg-white/[0.02] shrink-0">
                            <div className="flex items-center gap-2 bg-white/[0.06] rounded-xl border border-white/10 focus-within:border-violet-500/50 transition-colors px-3 py-1.5">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask Study Copilot anything..."
                                    disabled={loading}
                                    className="flex-1 bg-transparent text-white/90 text-[13px] placeholder:text-white/30 outline-none disabled:opacity-50"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={loading || !input.trim()}
                                    className="h-8 w-8 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:text-white/20 text-white flex items-center justify-center transition-colors shrink-0"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <p className="text-center text-[10px] text-white/20 mt-1.5">
                                Study Copilot can take actions on your behalf
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CopilotPanel;
