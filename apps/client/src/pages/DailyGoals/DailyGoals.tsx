import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Target,
    CheckCircle2,
    Flame,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    ListTodo,
} from 'lucide-react';
import { GoalMemorySelector, GoalItem, StatsCard } from '@/components/DailyGoals';
import { cn } from '@/lib/utils';

const DailyGoals = () => {
    const [newTask, setNewTask] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const {
        goals,
        isLoading,
        addGoal,
        toggleGoal,
        deleteGoal,
        isAdding,
        pastGoals,
        isLoadingHistory,
    } = useDailyGoals(selectedDate);

    const completedCount = goals.filter((g: any) => g.completed).length;
    const totalCount = goals.length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Calculate streak (mock for now - would need API endpoint for real streak)
    const streak = useMemo(() => {
        // This would ideally come from user stats API
        return 0;
    }, []);

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        addGoal(
            { task: newTask, date: selectedDate },
            {
                onSuccess: () => setNewTask(''),
            }
        );
    };

    const handleToggle = (id: string) => {
        toggleGoal(id);
    };

    const handleDelete = (id: string) => {
        deleteGoal(id);
    };

    const handleRenewGoal = (task: string) => {
        setNewTask(task);
    };

    const handlePreviousDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        setSelectedDate(format(date, 'yyyy-MM-dd'));
    };

    const handleNextDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        setSelectedDate(format(date, 'yyyy-MM-dd'));
    };

    const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
    const allCompleted = totalCount > 0 && completedCount === totalCount;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Main Content */}
            <main className="p-6 lg:p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">
                                <span className="text-foreground">Daily </span>
                                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                                    Goals
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                <span className={cn(
                                    "w-2 h-2 rounded-full animate-pulse",
                                    allCompleted ? "bg-success" : "bg-primary"
                                )} />
                                {allCompleted
                                    ? "All goals completed! Great job! 🎉"
                                    : "Plan and track your daily study tasks"}
                            </p>
                        </div>

                        {/* Date Navigator */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlePreviousDay}
                                className="rounded-full bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/70"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-xl border border-border/50",
                                isToday && "border-primary/30 bg-primary/5"
                            )}>
                                <CalendarDays className={cn(
                                    "h-4 w-4",
                                    isToday ? "text-primary" : "text-muted-foreground"
                                )} />
                                <span className="text-sm font-medium">
                                    {isToday ? 'Today' : format(new Date(selectedDate), 'MMM d, yyyy')}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleNextDay}
                                className="rounded-full bg-card/50 backdrop-blur-xl border-border/50 hover:bg-card/70"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <StatsCard
                        title="Completion"
                        value={`${completionPercentage}%`}
                        icon={Target}
                        badge={`${completedCount}/${totalCount}`}
                        badgeVariant={allCompleted ? "success" : "primary"}
                        iconColor="text-primary"
                        delay={0.1}
                    />
                    <StatsCard
                        title="Streak"
                        value={streak > 0 ? `${streak} Days` : 'Start Today'}
                        icon={Flame}
                        badge={streak > 0 ? 'On Fire!' : undefined}
                        badgeVariant="warning"
                        iconColor="text-warning"
                        delay={0.15}
                    />
                    <StatsCard
                        title="Completed"
                        value={completedCount}
                        icon={CheckCircle2}
                        badge={allCompleted ? 'Done!' : undefined}
                        badgeVariant="success"
                        iconColor="text-success"
                        delay={0.2}
                    />
                </div>

                {/* Progress Visualization */}
                {totalCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.25 }}
                        className="mb-6"
                    >
                        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-muted-foreground">Daily Progress</span>
                                <span className="text-sm font-bold text-foreground">{completionPercentage}%</span>
                            </div>
                            <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                                <motion.div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        allCompleted
                                            ? "bg-gradient-to-r from-success to-success/60"
                                            : "bg-gradient-to-r from-primary to-primary/60"
                                    )}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionPercentage}%` }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                />
                            </div>
                            {/* Visual Dots */}
                            <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                                {goals.map((goal: any, i: number) => (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4 + i * 0.03 }}
                                        className={cn(
                                            "w-3 h-3 rounded-full transition-all duration-300",
                                            goal.completed
                                                ? "bg-success scale-110"
                                                : "bg-muted/40 hover:bg-muted/60"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Main Goals Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 lg:p-8 shadow-xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <ListTodo className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    {isToday ? "Today's Goals" : `Goals for ${format(new Date(selectedDate), 'MMM d')}`}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {totalCount === 0
                                        ? 'No goals yet. Add one below!'
                                        : `${completedCount} of ${totalCount} completed`}
                                </p>
                            </div>
                        </div>
                        <GoalMemorySelector
                            pastGoals={pastGoals}
                            onSelect={handleRenewGoal}
                            disabled={isLoadingHistory}
                        />
                    </div>

                    {/* Add Goal Form */}
                    <form onSubmit={handleAddGoal} className="flex gap-3 mb-6">
                        <div className="flex-1 relative">
                            <Input
                                placeholder="What do you want to accomplish today?"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                disabled={isLoading || isAdding}
                                className="h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                            />
                            {newTask && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                </motion.div>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading || isAdding || !newTask.trim()}
                            className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 transition-all"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add
                        </Button>
                    </form>

                    {/* Goals List */}
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center py-12"
                            >
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    <span>Loading your goals...</span>
                                </div>
                            </motion.div>
                        ) : goals.length > 0 ? (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {goals.map((goal: any, index: number) => (
                                        <GoalItem
                                            key={goal.id}
                                            id={goal.id}
                                            task={goal.task}
                                            completed={goal.completed}
                                            priority={goal.priority}
                                            estimatedTime={goal.estimatedTime}
                                            index={index}
                                            onToggle={handleToggle}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-12"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                    <Target className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    No goals yet
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                                    Start by adding your first goal for {isToday ? 'today' : 'this day'}. You can also renew past goals from the dropdown above.
                                </p>
                                {pastGoals.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {pastGoals.slice(0, 3).map((goal) => (
                                            <Button
                                                key={goal.task}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRenewGoal(goal.task)}
                                                className="rounded-full text-xs"
                                            >
                                                <RotateCcw className="h-3 w-3 mr-1" />
                                                {goal.task.length > 25 ? goal.task.slice(0, 25) + '...' : goal.task}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Celebration State */}
                    <AnimatePresence>
                        {allCompleted && totalCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="mt-6 p-6 rounded-2xl bg-success/10 border border-success/20 text-center"
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                    className="inline-block mb-2"
                                >
                                    <Sparkles className="h-8 w-8 text-success" />
                                </motion.div>
                                <h3 className="text-lg font-semibold text-success mb-1">
                                    All Goals Completed! 🎉
                                </h3>
                                <p className="text-sm text-success/80">
                                    Great job! You&apos;ve completed all your goals for {isToday ? 'today' : 'this day'}.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

// Need to import this for the empty state
import { RotateCcw } from 'lucide-react';

export default DailyGoals;
