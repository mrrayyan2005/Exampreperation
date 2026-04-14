import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import {
    fetchTasks,
    fetchPendingTasks,
    fetchTodayTasks,
    fetchOverdueTasks,
    createTask,
    updateTask,
    deleteTask,
    markTaskAsComplete,
    setFilter
} from '@/redux/slices/tasksSlice';
import { Task } from '@/api/learningDomain/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Edit2,
    Trash2,
    Calendar,
    ClipboardList,
    Clock,
    AlertCircle,
    CheckCircle2,
    LayoutGrid,
    List,
    Kanban
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import newly created TaskBoard
import TaskBoard from '@/components/Tasks/TaskBoard';

const Tasks = () => {
    const dispatch = useAppDispatch();
    const { allTasks, pendingTasks, todayTasks, overdueTasks, isLoading, filter } = useAppSelector((state: RootState) => state.tasks);

    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subjectId: '',
        dueDate: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
    });

    useEffect(() => {
        loadTasks();
    }, [dispatch, filter]);

    const loadTasks = () => {
        switch (filter) {
            case 'all':
                dispatch(fetchTasks());
                break;
            case 'pending':
                dispatch(fetchPendingTasks());
                break;
            case 'today':
                dispatch(fetchTodayTasks());
                break;
            case 'overdue':
                dispatch(fetchOverdueTasks());
                break;
            default:
                dispatch(fetchTasks());
        }
    };

    const tasksToDisplay = filter === 'all' ? allTasks :
        filter === 'pending' ? pendingTasks :
            filter === 'today' ? todayTasks : overdueTasks;

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            subjectId: task.subjectId || '',
            dueDate: new Date(task.dueDate).toISOString().split('T')[0],
            priority: task.priority
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await dispatch(deleteTask(id));
        }
    };

    const handleCreate = () => {
        setEditingTask(undefined);
        setFormData({
            title: '',
            description: '',
            subjectId: '',
            dueDate: new Date().toISOString().split('T')[0],
            priority: 'medium'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTask) {
            await dispatch(updateTask({
                id: editingTask._id,
                data: formData
            }));
        } else {
            await dispatch(createTask(formData));
        }

        setIsModalOpen(false);
        setEditingTask(undefined);
        loadTasks();
    };

    const handleToggleComplete = async (task: Task) => {
        await dispatch(markTaskAsComplete(task._id));
        loadTasks();
    };

    const handleStatusChange = async (task: Task, newStatus: string) => {
        // Optimistic update wrapper or direct dispatch if slice handles it
        // Assuming backend accepts status update via updateTask or specialized endpoint
        // For now using updateTask
        if (task.status !== newStatus) {
            await dispatch(updateTask({
                id: task._id,
                data: { status: newStatus as Task['status'] }
            }));
            loadTasks();
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-white';
            case 'low': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getStatusIcon = (status: 'pending' | 'completed' | 'in-progress' | 'cancelled') => {
        if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        return status === 'pending' ? <Clock className="h-4 w-4 text-yellow-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />;
    };

    const isOverdue = (dueDate: string, status: string) => {
        return status !== 'completed' && new Date(dueDate) < new Date();
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My <span className="text-primary">Tasks</span></h1>
                    <p className="text-muted-foreground">
                        Track your homework, assignments, and study tasks
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'board')} className="h-9">
                        <TabsList className="h-9">
                            <TabsTrigger value="list" className="px-3">
                                <List className="h-4 w-4 mr-2" />
                                List
                            </TabsTrigger>
                            <TabsTrigger value="board" className="px-3">
                                <Kanban className="h-4 w-4 mr-2" />
                                Board
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Stats Cards - Only in List View or reduced in Board View if needed. Keeping for now. */}
            {viewMode === 'list' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">All Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{allTasks.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{todayTasks.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters - Hide in Board View as Board shows all columns typically, or keep if filtering desired */}
            <div className="flex gap-2">
                {[
                    { label: 'All', value: 'all' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Today', value: 'today' },
                    { label: 'Overdue', value: 'overdue' }
                ].map(({ label, value }) => (
                    <Button
                        key={value}
                        variant={filter === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => dispatch(setFilter(value as 'all' | 'pending' | 'today' | 'overdue'))}
                    >
                        {label}
                    </Button>
                ))}
            </div>

            {/* Content Area */}
            {viewMode === 'board' ? (
                <TaskBoard
                    tasks={tasksToDisplay}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                /* List View */
                <div className="space-y-4">
                    {tasksToDisplay.map((task) => (
                        <Card
                            key={task._id}
                            className={`transition-all ${task.status === 'completed' ? 'opacity-60 bg-muted/30' :
                                isOverdue(task.dueDate, task.status) ? 'border-red-300 bg-red-50/30' : ''
                                }`}
                        >
                            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <button
                                        onClick={() => handleToggleComplete(task)}
                                        className="mt-1 min-w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                                        style={{
                                            borderColor: task.status === 'completed' ? '#16a34a' : '#94a3b8',
                                            backgroundColor: task.status === 'completed' ? '#dcfce7' : 'transparent'
                                        }}
                                    >
                                        {task.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-green-700" />}
                                    </button>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                                                }`}>
                                                {task.title}
                                            </h3>
                                            <Badge className={getPriorityColor(task.priority)}>
                                                {task.priority}
                                            </Badge>
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                {getStatusIcon(task.status as Task['status'])}
                                                {task.status}
                                            </Badge>
                                        </div>

                                        {task.subject && (
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: task.subject.color }}></span>
                                                <span className="text-sm text-muted-foreground">{task.subject.name}</span>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span className={`flex items-center gap-1 ${isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : ''}`}>
                                                <Calendar className="h-3.5 w-3.5" />
                                                Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {isOverdue(task.dueDate, task.status) && (
                                                <span className="text-red-600 font-medium">(Overdue)</span>
                                            )}
                                        </div>

                                        {task.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(task)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(task._id)}
                                        className="text-destructive hover:text-destructive/90"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {tasksToDisplay.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-card/50">
                            <ClipboardList className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                You're all caught up! or create a new task.
                            </p>
                            <Button onClick={handleCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Task
                            </Button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Task Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="Enter task title"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Task description"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="dueDate">Due Date *</Label>
                            <Input
                                id="dueDate"
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' | 'urgent' })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingTask ? 'Update' : 'Create'} Task
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Tasks;