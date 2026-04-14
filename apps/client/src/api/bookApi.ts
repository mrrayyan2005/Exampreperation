import axiosInstance from './axiosInstance';

export interface Book {
    _id: string;
    title: string;
    author?: string;
    subject?: string;
    isbn?: string;
    edition?: string;
    publishedYear?: number;
    totalChapters?: number;
    notes?: string;
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    chapters?: any[];
}

export interface CreateBookRequest {
    title: string;
    author?: string;
    subject?: string;
    isbn?: string;
    edition?: string;
    publishedYear?: number;
    totalChapters?: number;
    notes?: string;
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    chapters?: any[];
}

export const bookApi = {
    getBooks: async (): Promise<Book[]> => {
        try {
            const response = await axiosInstance.get('/books', {
                // Add timestamp to bust cache
                params: { _t: Date.now() }
            });
            
            console.log('Books API Response:', response.data);
            
            // API can return either:
            // 1. Direct array: []
            // 2. Wrapped: { success: true, data: [...] }
            let books: Book[] = [];
            
            if (Array.isArray(response.data)) {
                books = response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                books = response.data.data;
            }
            
            console.log('Successfully loaded books:', books);
            return books;
        } catch (error) {
            console.error('Error fetching books:', error);
            return [];
        }
    },

    getBook: async (id: string): Promise<Book> => {
        const response = await axiosInstance.get(`/books/${id}`);
        return response.data?.data || response.data;
    },

    createBook: async (data: CreateBookRequest): Promise<Book> => {
        const response = await axiosInstance.post('/books', data);
        console.log('createBook - API Response:', response.data);
        return response.data?.data || response.data;
    },

    updateBook: async (id: string, data: Partial<CreateBookRequest>): Promise<Book> => {
        const response = await axiosInstance.put(`/books/${id}`, data);
        return response.data?.data || response.data;
    },

    deleteBook: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/books/${id}`);
    }
};
