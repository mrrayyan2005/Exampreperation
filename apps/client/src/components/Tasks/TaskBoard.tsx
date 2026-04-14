import React, { useMemo } from 'react';
import { Task } from '@/api/learningDomain/tasks';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Calendar, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TaskBoardProps {
    tasks: Task[];
    onStatusChange: (task: Task, newStatus: Task['status']) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

const COLUMNS: { id: Task['status']; title: string; color: string }[] = [
    { id: 'pending', title: 'To Do', color: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
    { id: 'completed', title: 'Done', color: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
];

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onStatusChange, onEdit, onDelete }) => {
    const tasksByStatus = useMemo(() => {
        const acc: Record<string, Task[]> = {
            'pending': [],
            'in-progress': [],
            'completed': [],
            'cancelled': []
        };
        tasks.forEach(task => {
            // Treat 'cancelled' as 'pending' for simplicity in this board view, or could separate
            const status = task.status === 'cancelled' ? 'pending' : task.status || 'pending';
            if (acc[status]) acc[status].push(task);
        });
        return acc;
    }, [tasks]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500 hover:bg-red-600 text-white border-transparent';
            case 'high': return 'bg-orange-500 hover:bg-orange-600 text-white border-transparent';
            case 'medium': return 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent';
            case 'low': return 'bg-green-500 hover:bg-green-600 text-white border-transparent';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="flex h-[calc(100vh-220px)] min-h-[500px] gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(column => (
                <div key={column.id} className="flex-shrink-0 w-80 flex flex-col rounded-xl bg-muted/40 border h-full">
                    {/* Column Header */}
                    <div className={`p-3 px-4 rounded-t-xl border-b flex items-center justify-between ${column.color}`}>
                        <div className="flex items-center gap-2 font-semibold">
                            <span className="text-sm uppercase tracking-wider">{column.title}</span>
                            <Badge variant="secondary" className="px-1.5 py-0 min-w-5 h-5 flex justify-center text-[10px]">
                                {tasksByStatus[column.id]?.length || 0}
                            </Badge>
                        </div>
                        {/* Could add column actions here */}
                    </div>

                    {/* Droppable Area */}
                    <ScrollArea className="flex-1 p-3">
                        {/* Note: Valid drag-and-drop requires complex setup with a library like @dnd-kit or react-beautiful-dnd. 
                 Using simple layout animation with buttons for status moving as a lightweight alternative for "Miro-like" interaction 
                 without heavy dnd implementation overhead in this step. */}
                        <div className="space-y-3">
                            <AnimatePresence>
                                {tasksByStatus[column.id]?.map((task) => (
                                    <motion.div
                                        key={task._id}
                                        layoutId={task._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative overflow-hidden">
                                            {/* Priority Strip */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'urgent' ? 'bg-red-500' :
                                                    task.priority === 'high' ? 'bg-orange-500' :
                                                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                                }`} />

                                            <CardContent className="p-3 pl-4 space-y-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-medium text-sm leading-tight line-clamp-2">{task.title}</h4>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreVertical className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => onDelete(task._id)}
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    {task.subject && (
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-transparent bg-secondary text-secondary-foreground" style={{ backgroundColor: `${task.subject.color}20`, color: task.subject.color }}>
                                                            {task.subject.name}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className={`text-[10px] px-1 py-0 h-5 border-transparent ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>

                                                {task.dueDate && (
                                                    <div className={`flex items-center gap-1 text-[10px] ${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-500 font-medium' : 'text-muted-foreground'
                                                        }`}>
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                )}

                                                {/* Quick Move Actions - Simulated DND */}
                                                <div className="pt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {column.id !== 'pending' && (
                                                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => onStatusChange(task, 'pending')}>
                                                            To Do
                                                        </Button>
                                                    )}
                                                    {column.id !== 'in-progress' && (
                                                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => onStatusChange(task, 'in-progress')}>
                                                            Doing
                                                        </Button>
                                                    )}
                                                    {column.id !== 'completed' && (
                                                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => onStatusChange(task, 'completed')}>
                                                            Done
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {tasksByStatus[column.id]?.length === 0 && (
                                <div className="h-32 flex flex-col items-center justify-center text-muted-foreground/40 border-2 border-dashed rounded-lg">
                                    <span className="text-xs">No tasks</span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            ))}
        </div>
    );
};

export default TaskBoard;
