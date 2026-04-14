import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Calendar,
  BookOpen,
  Star,
  Trash2,
  Edit3,
  Play,
  Pause,
  MoreVertical,
  Target,
  Coffee,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface StudySession {
  _id: string;
  subject: string;
  topic?: string;
  startTime: string;
  endTime: string;
  duration: number;
  sessionType: string;
  productivity: number;
  mood: string;
  notes?: string;
  breaksTaken: number;
  isActive?: boolean;
  focusTime?: number;
  createdAt: string;
}

interface SessionCardProps {
  session: StudySession;
  onEdit: (session: StudySession) => void;
  onDelete: (id: string) => void;
  onResume?: (session: StudySession) => void;
  className?: string;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onEdit,
  onDelete,
  onResume,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getSessionTypeInfo = (type: string) => {
    const types = {
      Reading: { color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', icon: BookOpen },
      Practice: { color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', icon: Target },
      Revision: { color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800', icon: TrendingUp },
      Test: { color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800', icon: CheckCircle2 },
      Notes: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800', icon: Edit3 }
    };
    return types[type as keyof typeof types] || types.Reading;
  };

  const getMoodInfo = (mood: string) => {
    const moods = {
      Excellent: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800', emoji: '😊' },
      Good: { color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', emoji: '🙂' },
      Average: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800', emoji: '😐' },
      Poor: { color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800', emoji: '😞' },
      'Very Poor': { color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800', emoji: '😓' }
    };
    return moods[mood as keyof typeof moods] || moods.Average;
  };

  const getPriorityBorder = (productivity: number) => {
    if (productivity >= 4) return 'border-l-green-500';
    if (productivity >= 3) return 'border-l-blue-500';
    if (productivity >= 2) return 'border-l-yellow-500';
    return 'border-l-red-500';
  };

  const getProductivityColor = (productivity: number) => {
    if (productivity >= 4) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (productivity >= 3) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    if (productivity >= 2) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const sessionTypeInfo = getSessionTypeInfo(session.sessionType);
  const moodInfo = getMoodInfo(session.mood);
  const TypeIcon = sessionTypeInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn("group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={`relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${getPriorityBorder(session.productivity)} bg-card/60 backdrop-blur-sm group`}>
        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-125 pointer-events-none"></div>
        <CardContent className="p-5 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <div className="flex items-start gap-3 mb-2">
                <div className={cn(
                  "p-2 rounded-lg border mt-0.5 shadow-sm",
                  sessionTypeInfo.color
                )}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg leading-tight tracking-tight">
                    {session.subject}
                  </h3>
                  {session.topic && (
                    <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                      {session.topic}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Time and Date */}
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-3 pl-[44px]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(session.startTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-muted-foreground hover:text-primary transition-opacity",
                    isHovered ? "opacity-100" : "opacity-0 sm:opacity-100"
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 border-border/50 backdrop-blur shadow-xl">
                <DropdownMenuItem onClick={() => onEdit(session)}>
                  <Edit3 className="h-4 w-4 mr-2 text-muted-foreground" />
                  Edit
                </DropdownMenuItem>
                {onResume && (
                  <DropdownMenuItem onClick={() => onResume(session)}>
                    <Play className="h-4 w-4 mr-2 text-primary" />
                    Resume
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(session._id)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-5 mt-2">
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-base font-bold text-foreground">
                {formatDuration(session.duration)}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Duration</div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/40 border border-border/50">
              <div className={cn(
                "text-base font-bold flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border",
                getProductivityColor(session.productivity)
              )}>
                {session.productivity}
                <Star className="h-3 w-3 fill-current" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Focus</div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/40 border border-border/50">
              <div className="text-base font-bold text-foreground flex items-center justify-center gap-1.5">
                {session.breaksTaken}
                <Coffee className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Breaks</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-5 bg-muted/30 p-3 rounded-lg border border-border/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-foreground">
                Session Focus Ratio
              </span>
              <span className="text-xs font-bold text-primary">
                {Math.round((session.focusTime || session.duration) / session.duration * 100)}%
              </span>
            </div>
            <Progress 
              value={(session.focusTime || session.duration) / session.duration * 100}
              className="h-1.5"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              variant="outline" 
              className={cn("text-[10px] border shadow-sm px-2 py-0.5 font-medium", sessionTypeInfo.color)}
            >
              {session.sessionType}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn("text-[10px] border shadow-sm px-2 py-0.5 font-medium", moodInfo.color)}
            >
              <span className="mr-1">{moodInfo.emoji}</span> {session.mood}
            </Badge>
            {session.isActive && (
              <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20 px-2 py-0.5 shadow-sm font-medium animate-pulse">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                Active
              </Badge>
            )}
          </div>

          {/* Notes Preview */}
          {session.notes && (
            <div className="mt-4 border-t border-border/50 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/40 px-2 py-1.5 h-auto transition-colors rounded-md"
              >
                <div className="text-left w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[10px] uppercase tracking-widest">
                      Notes
                    </span>
                    <span className="text-[10px]">
                        {showDetails ? 'Show less' : 'Read more'}
                    </span>
                  </div>
                  <div className={cn(
                    "text-xs leading-relaxed transition-all duration-300",
                    showDetails ? "line-clamp-none text-foreground" : "line-clamp-2"
                  )}>
                    {session.notes}
                  </div>
                </div>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SessionCard;
