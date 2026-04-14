/**
    * Query Key Factory - Centralized cache key management
    * 
    * This ensures consistent cache keys across React Query and Redux
    * 
    * Usage:
    * const { data } = useQuery({
    *   queryKey: queryKeys.auth.profile(),
    *   queryFn: fetchProfile
    * });
    * 
    * // Invalidate all auth data
    * queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    */
   
   export const queryKeys = {
     // Auth
     auth: {
       all: ['auth'] as const,
       profile: () => [...queryKeys.auth.all, 'profile'] as const,
       settings: () => [...queryKeys.auth.all, 'settings'] as const,
     },
   
     // Notifications
     notifications: {
       all: ['notifications'] as const,
       list: () => [...queryKeys.notifications.all, 'list'] as const,
       unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
     },
   
     // Daily Goals
     dailyGoals: {
       all: ['dailyGoals'] as const,
       byDate: (date: string) => [...queryKeys.dailyGoals.all, date] as const,
       history: () => [...queryKeys.dailyGoals.all, 'history'] as const,
     },
   
     // Books/Subjects
     books: {
       all: ['books'] as const,
       list: () => [...queryKeys.books.all, 'list'] as const,
       byId: (id: string) => [...queryKeys.books.all, id] as const,
       chapters: (bookId: string) => [...queryKeys.books.all, bookId, 'chapters'] as const,
     },
   
     // Tasks
     tasks: {
       all: ['tasks'] as const,
       list: (filters?: Record<string, unknown>) => 
         [...queryKeys.tasks.all, 'list', filters ?? {}] as const,
       byId: (id: string) => [...queryKeys.tasks.all, id] as const,
     },
   
     // Study Sessions
     studySessions: {
       all: ['studySessions'] as const,
       list: () => [...queryKeys.studySessions.all, 'list'] as const,
       active: () => [...queryKeys.studySessions.all, 'active'] as const,
       stats: () => [...queryKeys.studySessions.all, 'stats'] as const,
     },
   
     // Flashcards
     flashcards: {
       all: ['flashcards'] as const,
       decks: () => [...queryKeys.flashcards.all, 'decks'] as const,
       deckById: (id: string) => [...queryKeys.flashcards.all, 'decks', id] as const,
       studySession: (deckId: string) => [...queryKeys.flashcards.all, 'study', deckId] as const,
     },
   
     // Monthly Plan
     monthlyPlan: {
       all: ['monthlyPlan'] as const,
       current: () => [...queryKeys.monthlyPlan.all, 'current'] as const,
       byMonth: (month: string) => [...queryKeys.monthlyPlan.all, month] as const,
     },
   
     // Community
     community: {
       all: ['community'] as const,
       feed: () => [...queryKeys.community.all, 'feed'] as const,
       posts: (channelId?: string) => [...queryKeys.community.all, 'posts', channelId ?? 'all'] as const,
     },
   
     // Flowcharts
     flowcharts: {
       all: ['flowcharts'] as const,
       list: () => [...queryKeys.flowcharts.all, 'list'] as const,
       byId: (id: string) => [...queryKeys.flowcharts.all, id] as const,
     },
   
     // Progress/Analytics
     progress: {
       all: ['progress'] as const,
       dashboard: () => [...queryKeys.progress.all, 'dashboard'] as const,
       achievements: () => [...queryKeys.progress.all, 'achievements'] as const,
     },
   } as const;
   
   // Helper type for query keys
   export type QueryKey = readonly unknown[];