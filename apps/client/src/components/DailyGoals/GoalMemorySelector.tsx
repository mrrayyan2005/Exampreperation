import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GoalHistoryItem } from '@/hooks/useDailyGoals';

interface GoalMemorySelectorProps {
    pastGoals: GoalHistoryItem[];
    onSelect: (task: string) => void;
    disabled?: boolean;
}

export function GoalMemorySelector({ pastGoals, onSelect, disabled }: GoalMemorySelectorProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (task: string) => {
        onSelect(task);
        setOpen(false);
    };

    if (pastGoals.length === 0) {
        return null;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className="rounded-full px-4 h-10 bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/70 transition-all"
                >
                    <History className="h-4 w-4 mr-2 text-primary" />
                    <span className="hidden sm:inline">Renew Past Goal</span>
                    <span className="sm:hidden">Renew</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 bg-card/95 backdrop-blur-xl border-border/50"
                align="start"
            >
                <div className="p-3 border-b border-border/50">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-primary" />
                        Quick Renew
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        Select a goal you&apos;ve created before
                    </p>
                </div>
                <ScrollArea className="h-64">
                    <div className="p-2 space-y-1">
                        <AnimatePresence>
                            {pastGoals.map((goal, index) => (
                                <motion.button
                                    key={goal.task}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => handleSelect(goal.task)}
                                    className="w-full text-left p-3 rounded-xl hover:bg-primary/5 transition-colors group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                {goal.task}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Last: {goal.lastUsed}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="shrink-0 bg-primary/10 text-primary border-primary/20"
                                        >
                                            {goal.frequency}x
                                        </Badge>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
