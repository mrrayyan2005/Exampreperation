import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, 
  Clock, 
  Brain,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { Book } from '@/redux/slices/bookSlice';

interface RevisionTimelineProps {
  books: Book[];
}

interface TimelineEvent {
  id: string;
  type: 'revision' | 'test';
  chapterName: string;
  bookTitle: string;
  subject: string;
  date: Date;
  details: {
    timeSpent?: number;
    understanding?: string;
    score?: number;
    totalMarks?: number;
    notes?: string;
  };
}

const RevisionTimeline = ({ books }: RevisionTimelineProps) => {
  // Aggregate all revision and test events
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    const events: TimelineEvent[] = [];

    books.forEach(book => {
      book.chapters?.forEach((chapter, chapterIndex) => {
        // Add revisions
        chapter.revisions?.forEach((revision, revIndex) => {
          events.push({
            id: `${book.id}-${chapterIndex}-rev-${revIndex}`,
            type: 'revision',
            chapterName: chapter.name,
            bookTitle: book.title,
            subject: book.subject,
            date: new Date(revision.revisionDate || Date.now()),
            details: {
              timeSpent: revision.timeSpent,
              understanding: revision.understanding,
              notes: revision.notes
            }
          });
        });

        // Add tests
        chapter.tests?.forEach((test, testIndex) => {
          events.push({
            id: `${book.id}-${chapterIndex}-test-${testIndex}`,
            type: 'test',
            chapterName: chapter.name,
            bookTitle: book.title,
            subject: book.subject,
            date: new Date(test.testDate || Date.now()),
            details: {
              score: test.score,
              totalMarks: test.totalMarks,
              notes: test.notes
            }
          });
        });
      });
    });

    // Sort by date (newest first)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [books]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    
    timelineEvents.forEach(event => {
      const dateKey = event.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    
    return groups;
  }, [timelineEvents]);

  const getUnderstandingColor = (understanding?: string) => {
    switch (understanding) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (timelineEvents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
          <p className="text-muted-foreground max-w-md">
            Start tracking your revisions and tests to see your learning timeline here. 
            Go to your books and log your study sessions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Revision</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Test</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[600px]">
        <div className="space-y-6 pr-4">
          {Object.entries(groupedEvents).map(([date, events]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-3 sticky top-0 bg-background py-2 z-10">
                <Badge variant="outline" className="font-medium">
                  {date}
                </Badge>
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">
                  {events.length} activity{events.length !== 1 ? 'ies' : 'y'}
                </span>
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-border ml-3">
                {events.map((event) => (
                  <Card key={event.id} className="relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[25px] top-4 w-4 h-4 rounded-full border-2 border-background ${
                      event.type === 'revision' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {event.type === 'revision' ? (
                              <RefreshCw className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Brain className="h-4 w-4 text-green-500" />
                            )}
                            <span className="font-medium">
                              {event.type === 'revision' ? 'Revision Session' : 'Test Taken'}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate">
                              {event.chapterName}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <BookOpen className="h-3 w-3" />
                            <span>{event.bookTitle}</span>
                            <span>•</span>
                            <span>{event.subject}</span>
                          </div>

                          {event.type === 'revision' && (
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {event.details.understanding && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getUnderstandingColor(event.details.understanding)}`}
                                >
                                  {event.details.understanding}
                                </Badge>
                              )}
                              {event.details.timeSpent && event.details.timeSpent > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {event.details.timeSpent} min
                                </Badge>
                              )}
                            </div>
                          )}

                          {event.type === 'test' && event.details.score !== undefined && (
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`text-lg font-bold ${getScoreColor(
                                event.details.score, 
                                event.details.totalMarks || 100
                              )}`}>
                                {event.details.score}/{event.details.totalMarks || 100}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ({Math.round((event.details.score / (event.details.totalMarks || 100)) * 100)}%)
                              </span>
                            </div>
                          )}

                          {event.details.notes && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              "{event.details.notes}"
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {event.date.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RevisionTimeline;