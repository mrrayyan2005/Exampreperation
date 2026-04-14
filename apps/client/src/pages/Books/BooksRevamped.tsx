import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchBooks, updateBook, clearFilters } from '@/redux/slices/bookSlice';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Grid,
  List,
  BarChart3,
  BookOpen,
  Search as SearchIcon,
  Filter,
  X,
  Library,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Book } from '@/redux/slices/bookSlice';
import { useDebounce } from '@/hooks/useDebounce';

// Import our new components
import BooksOverview from '@/components/Books/BooksOverview';
import SearchAndFilters from '@/components/Books/SearchAndFilters';
import EnhancedBookCard from '@/components/Books/EnhancedBookCard';
import BookDetailModal from '@/components/Books/BookDetailModal';
import BookFormModal from '@/components/Books/BookFormModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SEO } from '@/components/Shared/SEO';
const ErrorBoundaryAny = ErrorBoundary as any;

type ViewMode = 'grid' | 'list' | 'analytics';

const BooksRevamped = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { books, isLoading, filters } = useAppSelector((state) => state.books);

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Fetch books on component mount and when filters change
  useEffect(() => {
    dispatch(fetchBooks(filters));
  }, [filters, dispatch]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = [...books];

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchLower) ||
        book.subject.toLowerCase().includes(searchLower) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.notes && book.notes.toLowerCase().includes(searchLower)) ||
        (book.tags && book.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Apply filters
    if (filters.subject) {
      filtered = filtered.filter(book =>
        book.subject.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    if (filters.priority) {
      filtered = filtered.filter(book => book.priority === filters.priority);
    }

    if (filters.status) {
      // Status filtering based on progress
      filtered = filtered.filter(book => {
        switch (filters.status) {
          case 'not_started':
            return book.completedChapters === 0;
          case 'in_progress':
            return book.completedChapters > 0 && book.completedChapters < book.totalChapters;
          case 'completed':
            return book.completedChapters === book.totalChapters;
          case 'needs_revision':
            // Use chapters with needs_revision status if available
            return book.chapters && book.chapters.some(chapter => chapter.status === 'needs_revision');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'title': {
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        }
        case 'subject': {
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        }
        case 'progress': {
          aValue = a.progressPercentage;
          bValue = b.progressPercentage;
          break;
        }
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        }
        case 'timeSpent': {
          aValue = a.totalTimeSpent;
          bValue = b.totalTimeSpent;
          break;
        }
        case 'createdAt': {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        }
        case 'averageTestScore': {
          aValue = a.averageTestScore;
          bValue = b.averageTestScore;
          break;
        }
        default: {
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
        }
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [books, searchTerm, filters, sortBy, sortOrder]);

  // Handlers
  const handleQuickChapterUpdate = useCallback(async (bookId: string, increment: number) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const newCompletedChapters = Math.max(
      0,
      Math.min(book.totalChapters, book.completedChapters + increment)
    );

    try {
      await dispatch(updateBook({
        id: bookId,
        data: {
          ...book,
          completedChapters: newCompletedChapters
        }
      }));

      toast({
        title: 'Progress updated!',
        description: `${newCompletedChapters} chapters completed`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update progress'
      });
    }
  }, [books, dispatch, toast]);

  const handleViewDetails = useCallback((book: Book) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
  }, []);

  const handleEdit = useCallback((book: Book) => {
    setEditingBook(book);
    setIsFormModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingBook(null);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseModals = useCallback(() => {
    setIsDetailModalOpen(false);
    setIsFormModalOpen(false);
    setSelectedBook(null);
    setEditingBook(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchTerm('');
    dispatch(clearFilters());
  }, [dispatch]);

  return (
    <ErrorBoundaryAny>
      <SEO 
        title="Study Library" 
        description="Manage your subjects and track your learning progress in one place."
      >
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 p-4 sm:p-6 min-h-screen bg-background"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">Study <span className="text-primary">Library</span></h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Manage your subjects and track your learning progress
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <Tabs defaultValue="subjects" className="w-full">
          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-6 mt-6">
            {isLoading && books.length === 0 ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Subject Header Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h2 className="text-lg font-semibold">Your Subjects</h2>
                    <p className="text-sm text-muted-foreground">
                      Track progress across all your study subjects
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center rounded-lg border p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 w-8 p-0 transition-all duration-200"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 w-8 p-0 transition-all duration-200"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button onClick={handleAddNew} className="transition-all duration-200 hover:shadow-lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Subject
                    </Button>
                  </div>
                </motion.div>

                {/* Overview Cards */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <BooksOverview books={books} isLoading={isLoading} />
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                >
                  <SearchAndFilters
                    books={books}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                  />
                </motion.div>

                {/* Content Area */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="space-y-4"
                >
                  {/* Results Info */}
                  {(searchTerm || Object.values(filters).some(f => f)) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <SearchIcon className="h-4 w-4" />
                        <span>
                          Showing {filteredAndSortedBooks.length} of {books.length} subjects
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleClearAll} className="transition-all duration-200">
                        <X className="h-3 w-3 mr-1" />
                        Clear all
                      </Button>
                    </motion.div>
                  )}

                  {/* Books Grid/List */}
                  {filteredAndSortedBooks.length > 0 ? (
                    <motion.div
                      layout
                      className={
                        viewMode === 'grid'
                          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                          : "space-y-4"
                      }
                    >
                      {filteredAndSortedBooks.map((book, index) => (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                            ease: "easeOut"
                          }}
                        >
                          <EnhancedBookCard
                            book={book}
                            onEdit={handleEdit}
                            onViewDetails={handleViewDetails}
                            onQuickChapterUpdate={handleQuickChapterUpdate}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-12"
                    >
                      {searchTerm || Object.values(filters).some(f => f) ? (
                        <>
                          <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No subjects found</h3>
                          <p className="text-muted-foreground mb-4">
                            No subjects match your current search and filters
                          </p>
                          <Button variant="outline" onClick={handleClearAll} className="transition-all duration-200">
                            <X className="h-4 w-4 mr-2" />
                            Clear filters
                          </Button>
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No subjects yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Start building your study library by adding your first subject
                          </p>
                          <Button onClick={() => setIsFormModalOpen(true)} className="transition-all duration-200 hover:shadow-lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subject
                          </Button>
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </>
            )}
          </TabsContent>

        </Tabs>
        </motion.div>

        {/* Modals */}
        <BookDetailModal
          book={selectedBook}
          isOpen={isDetailModalOpen}
          onClose={handleCloseModals}
        />

        <BookFormModal
          book={editingBook}
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
        />
      </motion.div>
      </SEO>
    </ErrorBoundaryAny>
  );
};

export default BooksRevamped;
