import axiosInstance from '../axiosInstance';

export interface ConversationRequest {
  text: string;
  conversationId?: string;
  timezone?: string;
}

export interface ConversationResponse {
  success: boolean;
  message: string;
  conversationId: string;
  suggestions?: string[];
  actionTaken?: {
    type: string;
    data?: any;
  };
  requiresConfirmation?: boolean;
}

export interface QuickSuggestion {
  id: string;
  label: string;
  intent: string;
  category: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    actionTaken?: any;
    success?: boolean;
  };
}

export interface ConversationHistory {
  success: boolean;
  conversationId: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Send a message to the AI agent
 */
export async function sendMessage(
  request: ConversationRequest
): Promise<ConversationResponse> {
  try {
    const response = await axiosInstance.post<ConversationResponse>(
      '/ai/chat',
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to send message'
    );
  }
}

/**
 * Get quick suggestions for the user
 */
export async function getQuickSuggestions(): Promise<
  QuickSuggestion[]
> {
  // Feature temporarily disabled
  return [];
}

/**
 * Get conversation history
 */
export async function getConversationHistory(
  conversationId: string
): Promise<ConversationHistory | null> {
  try {
    const response = await axiosInstance.get<ConversationHistory>(
      `/ai/chat/history/${conversationId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error getting conversation history:', error);
    return null;
  }
}

/**
 * Clear conversation history
 */
export async function clearConversation(
  conversationId: string
): Promise<boolean> {
  try {
    await axiosInstance.delete(`/ai/chat/history/${conversationId}`);
    return true;
  } catch (error: any) {
    console.error('Error clearing conversation:', error);
    return false;
  }
}

/**
 * Stream chat response (for typing indicator effect)
 */
export async function streamChatResponse(
  text: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  // This is a placeholder for future streaming implementation
  // Currently falls back to regular sendMessage
  const response = await sendMessage({ text });
  onChunk(response.message);
}