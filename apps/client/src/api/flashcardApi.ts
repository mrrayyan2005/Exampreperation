import axiosInstance from './axiosInstance';

export interface Deck {
    _id: string;
    name: string;
    topic: string;
    description?: string;
    user: string;
    tags?: string[];
    isPublic?: boolean;
    stats: {
        totalCards: number;
        cardsLearned: number;
        lastReviewDate?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface Flashcard {
    _id: string;
    front: string;
    back: string;
    hint?: string;
    deck: string;
    state?: number;
    difficulty?: number;
    stability?: number;
    reps?: number;
    lapses?: number;
    due?: string;
    last_review?: string;
    reviewCount?: number;
    lastGrade?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DeckStats {
    totalCards: number;
    dueCards: number;
    learnedCards: number;
    accuracyRate: number;
    avgDifficulty: number;
    trend: { date: string; reviews: number; accuracy: number }[];
}

export interface UserAnalytics {
    deckCount: number;
    totalCards: number;
    dueCards: number;
    learnedCards: number;
    accuracyRate: number;
    reviewTrend: { date: string; reviews: number; accuracy: number }[];
    streakDays: number;
}

const flashcardApi = {
    getDecks: async () => {
        const response = await axiosInstance.get('/flashcards/decks');
        return response.data.data;
    },

    createDeck: async (data: Partial<Deck>) => {
        const response = await axiosInstance.post('/flashcards/decks', data);
        return response.data.data;
    },

    getDeck: async (deckId: string) => {
        const response = await axiosInstance.get(`/flashcards/decks/${deckId}`);
        return response.data.data;
    },

    updateDeck: async (deckId: string, data: Partial<Deck>) => {
        const response = await axiosInstance.put(`/flashcards/decks/${deckId}`, data);
        return response.data.data;
    },

    deleteDeck: async (deckId: string) => {
        const response = await axiosInstance.delete(`/flashcards/decks/${deckId}`);
        return response.data.data;
    },

    getDeckStats: async (deckId: string) => {
        const response = await axiosInstance.get(`/flashcards/decks/${deckId}/stats`);
        return response.data.data as DeckStats;
    },

    getUserAnalytics: async () => {
        const response = await axiosInstance.get('/flashcards/user/analytics');
        return response.data.data as UserAnalytics;
    },

    createCard: async (data: { deck: string; front: string; back: string; hint?: string }) => {
        const response = await axiosInstance.post('/flashcards/cards', data);
        return response.data.data;
    },

    getCardsByDeck: async (deckId: string) => {
        const response = await axiosInstance.get('/flashcards/cards', { params: { deckId } });
        return response.data.data as Flashcard[];
    },

    getCard: async (cardId: string) => {
        const response = await axiosInstance.get(`/flashcards/cards/${cardId}`);
        return response.data.data;
    },

    deleteCard: async (cardId: string) => {
        const response = await axiosInstance.delete(`/flashcards/cards/${cardId}`);
        return response.data.data;
    },

    updateCard: async (cardId: string, data: Partial<Flashcard>) => {
        const response = await axiosInstance.put(`/flashcards/${cardId}`, data);
        return response.data.data;
    },

    bulkDeleteCards: async (cardIds: string[]) => {
        const response = await axiosInstance.post('/flashcards/cards/bulk-delete', { cardIds });
        return response.data.data;
    },

    getDueCards: async (deckId?: string) => {
        const params = deckId ? { deckId } : {};
        const response = await axiosInstance.get('/flashcards/cards/due', { params });
        return response.data.data;
    },

    submitReview: async (cardId: string, quality: number) => {
        const response = await axiosInstance.post(`/flashcards/cards/${cardId}/review`, { quality });
        return response.data.data;
    }
};

export default flashcardApi;
