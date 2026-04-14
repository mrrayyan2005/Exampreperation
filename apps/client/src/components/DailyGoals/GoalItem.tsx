import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GoalItemProps {
    id: string;
    task: string;
    completed: boolean;
    priority?: 'High' | 'Medium' | 'Low';
    estimatedTime?: number;
    index: number;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    isToggling?: boolean;
    isDeleting?: boolean;
}

const priorityConfig = {
    High: {
        color: 'bg-destructive/15 text-destructive border-destructive/25',
        icon: AlertCircle,
        label: 'High',
    },
    Medium: {
        color: 'bg-warning/15 text-warning border-warning/25',
        icon: Clock,
        label: 'Medium',
    },
    Low: {
        color: 'bg-success/15 text-success border-success/25',
        icon: Clock,
        label: 'Low',
    },
};

export function GoalItem({
    id,
    task,
    completed,
    priority = 'Medium',
    estimatedTime,
    index,
    onToggle,
    onDelete,
    isToggling,
    isDeleting,
}: GoalItemProps) {
    const priorityStyle = priorityConfig[priority] || priorityConfig.Medium;
    const PriorityIcon = priorityStyle.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: 'easeOut',
            }}
            className={cn(
                'group flex items-center gap-3 rounded-2xl border p-4 transition-all duration-300',
                'bg-card/40 backdrop-blur-sm border-border/40 hover:bg-card/60 hover:border-border/60 hover:shadow-lg',
                completed && 'bg-muted/30 border-muted/30'
            )}
        >
            <button
                onClick={() => onToggle(id)}
                disabled={isToggling}
                className={cn(
                    'flex-shrink-0 p-2 rounded-xl transition-all duration-200',
                    'hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed',
                    completed && 'hover:bg-success/10'
                )}
                type="button"
            >
                {completed ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                ) : (
                    <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                )}
            </button>

            <div className="flex-1 min-w-0">
                <p
                    className={cn(
                        'text-sm font-medium transition-all duration-300',
                        completed
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground'
                    )}
                >
                    {task}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                        variant="secondary"
                        className={cn(
                            'text-xs px-2 py-0.5 rounded-md',
                            priorityStyle.color
                        )}
                    >
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {priorityStyle.label}
                    </Badge>
                    {estimatedTime && estimatedTime > 0 && (
                        <Badge
                            variant="outline"
                            className="text-xs px-2 py-0.5 rounded-md text-muted-foreground"
                        >
                            <Clock className="h-3 w-3 mr-1" />
                            {estimatedTime} min
                        </Badge>
                    )}
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(id)}
                disabled={isDeleting}
                className={cn(
                    'opacity-0 group-hover:opacity-100 transition-all duration-200',
                    'h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive',
                    'disabled:opacity-50'
                )}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </motion.div>
    );
}
