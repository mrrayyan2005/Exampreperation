import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Book,
  Clock,
  Target,
  Award,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Plus,
  Minus,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { Book as BookType } from '@/redux/slices/bookSlice';
import { useAppDispatch } from '@/redux/hooks';
import { updateBook, deleteBook } from '@/redux/slices/bookSlice';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface EnhancedBookCardProps {
  book: BookType;
  onEdit: (book: BookType) => void;
  onViewDetails: (book: BookType) => void;
  onQuickChapterUpdate: (bookId: string, increment: number) => void;
}

const EnhancedBookCard = ({
  book,
  onEdit,
  onViewDetails,
  onQuickChapterUpdate
}: EnhancedBookCardProps) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await dispatch(deleteBook(book.id));
        toast({ title: 'Book deleted successfully' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to delete book' });
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusInfo = () => {
    const { completedChapters, totalChapters, chapters } = book;
    const chaptersNeedingRevision = chapters?.filter(ch => ch.status === 'needs_revision').length || 0;

    if (completedChapters === totalChapters && totalChapters > 0) {
      return {
        status: 'Completed',
        color: 'text-green-600 dark:text-green-400',
        icon: Award,
        bgColor: 'bg-green-50 dark:bg-green-950'
      };
    }

    if (chaptersNeedingRevision > 0) {
      return {
        status: 'Needs Revision',
        color: 'text-orange-600 dark:text-orange-400',
        icon: RefreshCw,
        bgColor: 'bg-orange-50 dark:bg-orange-950'
      };
    }

    if (completedChapters > 0) {
      return {
        status: 'In Progress',
        color: 'text-blue-600 dark:text-blue-400',
        icon: TrendingUp,
        bgColor: 'bg-blue-50 dark:bg-blue-950'
      };
    }

    return {
      status: 'Not Started',
      color: 'text-gray-600 dark:text-gray-400',
      icon: BookOpen,
      bgColor: 'bg-gray-50 dark:bg-gray-900'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Calculate progress percentage properly
  const progressPercentage = book.totalChapters > 0
    ? Math.round((book.completedChapters / book.totalChapters) * 100)
    : 0;

  // Calculate chapters needing revision from the actual chapter data
  const chaptersNeedingRevision = book.chapters?.filter(ch => ch.status === 'needs_revision').length || 0;

  return (
    <Card className="group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg truncate font-bold text-foreground" title={book.title}>
                {book.title}
              </CardTitle>
              <Badge
                className={`text-xs border ${getPriorityColor(book.priority)}`}
                variant="secondary"
              >
                {book.priority}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5" title={book.subject}>
                <BookOpen className="h-3.5 w-3.5 text-primary" /> {book.subject}
              </p>
              {book.author && (
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5" title={book.author}>
                  <Edit className="h-3 w-3" /> {book.author}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewDetails(book)}>
                <Eye className="h-4 w-4 mr-2 text-primary" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(book)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Book
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Book
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold w-fit border ${statusInfo.bgColor.replace('bg-', 'border-').replace('50', '200')} ${statusInfo.bgColor} ${statusInfo.color}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusInfo.status}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {book.completedChapters} / {book.totalChapters} chapters
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2"
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{progressPercentage}% completed</span>
            {chaptersNeedingRevision > 0 && (
              <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                {chaptersNeedingRevision} need revision
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {book.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{book.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Quick Actions - Only Details Button */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(book)}
            className="w-full text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
        </div>

        {/* Created Date */}
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Added {format(new Date(book.createdAt), 'MMM dd, yyyy')}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedBookCard;
