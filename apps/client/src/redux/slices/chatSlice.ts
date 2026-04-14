import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  sendMessage,
  getQuickSuggestions,
  getConversationHistory,
  clearConversation,
  ConversationResponse,
  QuickSuggestion,
  ConversationMessage,
} from '../../api/ai/chat';

interface ChatState {
  conversationId: string | null;
  messages: ConversationMessage[];
  suggestions: QuickSuggestion[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
}

const initialState: ChatState = {
  conversationId: null,
  messages: [],
  suggestions: [],
  isLoading: false,
  error: null,
  isTyping: false,
};

// Async Thunks
export const sendMessageAsync = createAsyncThunk(
  'chat/sendMessage',
  async (
    { text, conversationId }: { text: string; conversationId?: string }
  ) => {
    const response = await sendMessage({ text, conversationId });
    return response;
  }
);

export const fetchSuggestionsAsync = createAsyncThunk(
  'chat/fetchSuggestions',
  async () => {
    const suggestions = await getQuickSuggestions();
    return suggestions;
  }
);

export const fetchHistoryAsync = createAsyncThunk(
  'chat/fetchHistory',
  async (conversationId: string) => {
    const history = await getConversationHistory(conversationId);
    return history;
  }
);

export const clearConversationAsync = createAsyncThunk(
  'chat/clearConversation',
  async (conversationId: string) => {
    const success = await clearConversation(conversationId);
    return { conversationId, success };
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: `msg_${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearMessages: (state) => {
      state.messages = [];
      state.conversationId = null;
    },
    setConversationId: (state, action: PayloadAction<string>) => {
      state.conversationId = action.payload;
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessageAsync.pending, (state) => {
        state.isLoading = true;
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendMessageAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isTyping = false;
        state.conversationId = action.payload.conversationId;
        
        // Add assistant message
        state.messages.push({
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: action.payload.message,
          timestamp: new Date().toISOString(),
          metadata: {
            intent: action.payload.actionTaken?.type,
            actionTaken: action.payload.actionTaken,
            success: action.payload.success,
          },
        });

        // Update suggestions if provided
        if (action.payload.suggestions) {
          state.suggestions = action.payload.suggestions.map((s, i) => ({
            id: `sugg_${i}`,
            label: s,
            intent: 'custom',
            category: 'general',
          }));
        }
      })
      .addCase(sendMessageAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isTyping = false;
        state.error = action.error.message || 'Failed to send message';
        
        // Add error message as assistant response
        state.messages.push({
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `❌ Sorry, I encountered an error: ${state.error}`,
          timestamp: new Date().toISOString(),
        });
      })
      // Fetch Suggestions
      .addCase(fetchSuggestionsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSuggestionsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suggestions = action.payload;
      })
      .addCase(fetchSuggestionsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch suggestions';
      })
      // Fetch History
      .addCase(fetchHistoryAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHistoryAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.messages = action.payload.messages;
          state.conversationId = action.payload.conversationId;
        }
      })
      .addCase(fetchHistoryAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch history';
      })
      // Clear Conversation
      .addCase(clearConversationAsync.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.messages = [];
          state.conversationId = null;
        }
      });
  },
});

// Actions
export const {
  addUserMessage,
  clearMessages,
  setConversationId,
  setTyping,
  clearError,
} = chatSlice.actions;

// Selectors
export const selectChatMessages = (state: { chat: ChatState }) => state.chat.messages;
export const selectConversationId = (state: { chat: ChatState }) => state.chat.conversationId;
export const selectSuggestions = (state: { chat: ChatState }) => state.chat.suggestions;
export const selectIsLoading = (state: { chat: ChatState }) => state.chat.isLoading;
export const selectIsTyping = (state: { chat: ChatState }) => state.chat.isTyping;
export const selectError = (state: { chat: ChatState }) => state.chat.error;

// Reducer
export default chatSlice.reducer;