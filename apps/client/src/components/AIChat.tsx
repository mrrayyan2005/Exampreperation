import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, MessageSquare, X, Sparkles, Trash2 } from 'lucide-react';
import {
  sendMessageAsync,
  fetchSuggestionsAsync,
  clearMessages,
  selectChatMessages,
  selectSuggestions,
  selectIsTyping,
  selectConversationId,
  selectError,
  clearError,
} from '../redux/slices/chatSlice';
import type { RootState, AppDispatch } from '../redux/store';

const AIChat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const messages = useSelector((state: RootState) => selectChatMessages(state));
  const suggestions = useSelector((state: RootState) => selectSuggestions(state));
  const isTyping = useSelector((state: RootState) => selectIsTyping(state));
  const conversationId = useSelector((state: RootState) => selectConversationId(state));
  const error = useSelector((state: RootState) => selectError(state));
  
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Fetch suggestions on mount
  useEffect(() => {
    dispatch(fetchSuggestionsAsync());
  }, [dispatch]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isTyping) return;

    const messageText = input.trim();
    setInput('');

    try {
      await dispatch(sendMessageAsync({
        text: messageText,
        conversationId: conversationId || undefined,
      })).unwrap();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [dispatch, input, isTyping, conversationId]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleClearConversation = useCallback(() => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      dispatch(clearMessages());
      dispatch(fetchSuggestionsAsync());
    }
  }, [dispatch]);

  const formatMessage = useCallback((content: string) => {
    // Convert markdown-like formatting to HTML
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  }, []);

  const getMessageTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);


  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 group"
        aria-label="Open AI Chat"
      >
        <MessageSquare className="w-6 h-6 group-hover:animate-bounce" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${minimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-4rem)]'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-semibold">AI Study Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? <MessageSquare className="w-5 h-5" /> : <MessageSquare className="w-5 h-5 rotate-180" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <p className="font-medium">Welcome to your AI Study Assistant!</p>
                <p className="text-sm mt-2">Ask me anything about your studies, tasks, exams, or schedule.</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-sm">{formatMessage(message.content)}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-purple-200' : 'text-gray-400'
                    }`}
                  >
                    {getMessageTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && messages.length < 3 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.label)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
            {error && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => dispatch(clearError())}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearConversation}
                  className="bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default AIChat;