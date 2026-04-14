import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Trash2,
  Edit,
  Link,
  Upload,
  Play,
  StopCircle,
  Sparkles
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchSyllabus,
  fetchSyllabusStats,
  fetchRecommendations,
  createSyllabusItem,
  updateSyllabusItem,
  deleteSyllabusItem,
  bulkUpdateSyllabus,
  toggleItemExpansion,
  toggleItemSelection,
  clearSelection,
  setFilters,
  clearFilters,
  updateItemStatusOptimistic
} from '@/redux/slices/syllabusSlice';
import { SyllabusItem, syllabusApi } from '@/api/syllabusApi';
import { studySessionApi } from '@/api/studySessionApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import DailyProgressWidget from '@/components/DailyProgressWidget';

const SyllabusTracker: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const {
    items,
    stats,
    recommendations,
    selectedItems,
    isLoading,
    statsLoading,
    recommendationsLoading,
    error,
    filters,
    expandedItems
  } = useAppSelector((state) => state.syllabus);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<SyllabusItem | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    title: '',
    description: '',
    subject: '',
    unit: '',
    topic: '',
    subtopic: '',
    level: 1,
    parentId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedHours: 0,
  });

  // Timer state for Live Study
  const [activeSession, setActiveSession] = useState<{
    item: SyllabusItem;
    startTime: Date;
  } | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isSmartLinking, setIsSmartLinking] = useState(false);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);

  const fetchDailyLogs = async () => {
    try {
      const logs = await studySessionApi.getDailyStats();
      setDailyLogs(logs);
    } catch (error) {
      console.error('Failed to fetch daily logs:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchSyllabus(filters));
    dispatch(fetchSyllabusStats({}));
    dispatch(fetchRecommendations(5));
    fetchDailyLogs();
  }, [dispatch, filters]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStudy = (item: SyllabusItem) => {
    if (activeSession) {
      toast({
        variant: 'destructive',
        title: 'Session already in progress',
        description: 'Please stop the current session before starting a new one.'
      });
      return;
    }

    setActiveSession({
      item,
      startTime: new Date()
    });
    setSeconds(0);

    // Optionally update status to in_progress immediately
    if (item.status === 'not_started') {
      handleStatusUpdate(item, 'in_progress');
    }

    toast({
      title: `Started studying: ${item.title}`,
      description: 'Progress is being tracked.'
    });
  };

  const handleStopStudy = async () => {
    if (!activeSession) return;

    const endTime = new Date();
    const duration = Math.round(seconds / 60); // minutes

    try {
      await studySessionApi.createSession({
        subject: activeSession.item.subject,
        topic: activeSession.item.title,
        startTime: activeSession.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration,
        sessionType: 'Reading',
        syllabusItemId: activeSession.item._id
      });

      toast({
        title: 'Study session saved',
        description: `You studied for ${duration} minutes. Syllabus progress updated.`
      });

      setActiveSession(null);
      setSeconds(0);

      // Refresh data
      dispatch(fetchSyllabus(filters));
      dispatch(fetchSyllabusStats({}));
      fetchDailyLogs();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save session',
        description: error.message || 'Something went wrong'
      });
    }
  };

  const handleSmartLink = async (item: SyllabusItem) => {
    setIsSmartLinking(true);
    try {
      const response = await syllabusApi.suggestResources(item._id, true);
      if (response.success) {
        toast({
          title: 'Resources Matched!',
          description: `Automatically linked ${response.data.length} books to ${item.title}.`,
        });
        dispatch(fetchSyllabus(filters));
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Smart Link failed',
        description: error.response?.data?.message || 'Failed to match resources',
      });
    } finally {
      setIsSmartLinking(false);
    }
  };

  // Status color mapping
  const getStatusColor = (status: SyllabusItem['status']) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'needs_revision': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: SyllabusItem['status']) => {
    switch (status) {
      case 'not_started': return AlertCircle;
      case 'in_progress': return Clock;
      case 'completed': return CheckCircle2;
      case 'needs_revision': return RotateCcw;
      default: return AlertCircle;
    }
  };

  const getPriorityColor = (priority: SyllabusItem['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-600';
      case 'medium': return 'bg-blue-100 text-blue-600';
      case 'high': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Calculate completion percentage for an item and its children
  const calculateCompletion = (item: SyllabusItem): number => {
    if (!item.children || item.children.length === 0) {
      return item.status === 'completed' ? 100 : 0;
    }

    const completedChildren = item.children.filter(child =>
      calculateCompletion(child) === 100
    ).length;

    return Math.round((completedChildren / item.children.length) * 100);
  };

  // Handle status update
  const handleStatusUpdate = async (item: SyllabusItem, newStatus: SyllabusItem['status']) => {
    try {
      // Optimistic update
      dispatch(updateItemStatusOptimistic({ id: item._id, status: newStatus }));

      await dispatch(updateSyllabusItem({
        id: item._id,
        data: { status: newStatus }
      })).unwrap();

      toast({ title: 'Status updated successfully' });

      // Refresh data to get updated parent statuses
      dispatch(fetchSyllabus(filters));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update status',
        description: error as string
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No items selected',
        description: 'Please select items to perform bulk actions.'
      });
      return;
    }

    try {
      let actionData = {};

      if (action === 'set_priority_high') {
        actionData = { priority: 'high' };
        action = 'set_priority';
      } else if (action === 'add_hours_1') {
        actionData = { hours: 1 };
        action = 'add_hours';
      }

      await dispatch(bulkUpdateSyllabus({
        items: selectedItems,
        action: action as 'mark_completed' | 'mark_in_progress' | 'set_priority' | 'add_hours',
        actionData
      })).unwrap();

      toast({ title: `Updated ${selectedItems.length} items successfully` });
      dispatch(clearSelection());
      dispatch(fetchSyllabus(filters));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Bulk action failed',
        description: error as string
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await syllabusApi.uploadSyllabus(file);
      if (response.success) {
        toast({
          title: 'Syllabus imported successfully',
          description: `Imported subject: ${response.data.subject}`,
        });
        setShowImportDialog(false);
        dispatch(fetchSyllabus(filters));
        dispatch(fetchSyllabusStats({}));
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: error.response?.data?.message || 'Failed to upload syllabus',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await dispatch(updateSyllabusItem({
          id: editingItem._id,
          data: newItemForm
        })).unwrap();
        toast({ title: 'Item updated successfully' });
        setEditingItem(null);
      } else {
        await dispatch(createSyllabusItem(newItemForm)).unwrap();
        toast({ title: 'Item created successfully' });
      }

      setShowAddDialog(false);
      resetForm();
      dispatch(fetchSyllabus(filters));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingItem ? 'Failed to update item' : 'Failed to create item',
        description: error as string
      });
    }
  };

  const resetForm = () => {
    setNewItemForm({
      title: '',
      description: '',
      subject: '',
      unit: '',
      topic: '',
      subtopic: '',
      level: 1,
      parentId: '',
      priority: 'medium',
      estimatedHours: 0,
    });
  };

  // Render syllabus item
  const renderSyllabusItem = (item: SyllabusItem, depth: number = 0) => {
    const isExpanded = expandedItems.includes(item._id);
    const isSelected = selectedItems.includes(item._id);
    const hasChildren = item.children && item.children.length > 0;
    const completion = calculateCompletion(item);
    const StatusIcon = getStatusIcon(item.status);

    return (
      <div key={item._id} className="relative">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`
            group flex items-center gap-3 p-2 rounded-md border-b border-border/50 hover:bg-muted/50 transition-colors
            ${isSelected ? 'bg-primary/5 border-primary/20' : ''}
          `}
          style={{ paddingLeft: `${Math.max(0.5, depth * 1.5)}rem` }}
        >
          {/* Indentation/Guide Line would go here if we moved away from margin-based depth, but simple padding works well for clean lists */}

          <div className="flex items-center gap-1 min-w-[24px]">
            {hasChildren ? (
              <button
                onClick={(e) => { e.stopPropagation(); dispatch(toggleItemExpansion(item._id)); }}
                className="p-0.5 rounded-sm hover:bg-muted text-muted-foreground"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-4" />
            )}
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => dispatch(toggleItemSelection(item._id))}
              className="h-4 w-4"
            />
          </div>

          <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
            {/* Title & Icons */}
            <div className="col-span-5 flex items-center gap-2 overflow-hidden">
              <StatusIcon className={`h-4 w-4 shrink-0 ${item.status === 'completed' ? 'text-green-500' :
                item.status === 'in_progress' ? 'text-blue-500' : 'text-muted-foreground'
                }`} />
              <span className={`font-medium truncate text-sm ${item.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}>
                {item.title}
              </span>
              {item.priority === 'high' && <Badge variant="destructive" className="h-4 px-1 text-[10px]">High</Badge>}
            </div>

            {/* Meta Info (Hidden on small screens) */}
            <div className="col-span-3 hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="h-5 text-[10px] font-normal">{item.subject}</Badge>
              {item.estimatedHours > 0 && <span>{item.estimatedHours}h est.</span>}
            </div>

            {/* Progress Bar */}
            <div className="col-span-3 flex items-center gap-2">
              <Progress value={completion} className="h-1.5 w-16 md:w-24" />
              <span className="text-xs text-muted-foreground w-8 text-right">{completion}%</span>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleStartStudy(item)} disabled={!!activeSession}>
                    <Play className="h-3 w-3 mr-2" /> Start Study
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSmartLink(item)}>
                    <Sparkles className="h-3 w-3 mr-2" /> Smart Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    setEditingItem(item);
                    setNewItemForm({
                      title: item.title,
                      description: item.description || '',
                      subject: item.subject,
                      unit: item.unit || '',
                      topic: item.topic || '',
                      subtopic: item.subtopic || '',
                      level: item.level,
                      parentId: item.parentId || '',
                      priority: item.priority,
                      estimatedHours: item.estimatedHours,
                    });
                    setShowAddDialog(true);
                  }}>
                    <Edit className="h-3 w-3 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setNewItemForm({
                      ...newItemForm,
                      parentId: item._id,
                      subject: item.subject,
                      unit: item.unit || '',
                      topic: item.topic || '',
                      level: Math.min(item.level + 1, 4),
                    });
                    setShowAddDialog(true);
                  }}>
                    <Plus className="h-3 w-3 mr-2" /> Add Child
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => dispatch(deleteSyllabusItem(item._id))} className="text-red-600">
                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {isExpanded && hasChildren && (
          <div className="relative">
            {/* Simple Guide Line */}
            <div className="absolute left-[calc(0.5rem+11px)] top-0 bottom-0 w-px bg-border/50"
              style={{ left: `${Math.max(0.5, depth * 1.5) + 0.7}rem` }}
            />
            <AnimatePresence>
              {item.children!.map(child => renderSyllabusItem(child, depth + 1))}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  };

  // Filter and search functionality
  const filteredItems = useMemo(() => {
    return items; // Filtering is handled on the backend
  }, [items]);

  return (
    <div className="space-y-6">
      {/* ... (Header removed previously) ... */}

      {/* ... (Stats removed previously) ... */}

      {/* ... (Filters removed previously) ... */}

      {/* Syllabus Tree */}
      <Card className="border-none shadow-sm bg-card/50">
        <CardContent className="p-0">
          {/* Table Header Row */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b text-xs font-medium text-muted-foreground bg-muted/20">
            <div className="col-span-5 pl-8">Topic / Item</div>
            <div className="col-span-3 hidden md:block">Subject & Info</div>
            <div className="col-span-3">Progress</div>
            <div className="col-span-1"></div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground">Loading your curriculum...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="p-4 rounded-full bg-muted">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">No Syllabus Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Get started by adding a subject or importing an existing syllabus file.
                </p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {filteredItems.map(item => renderSyllabusItem(item))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs ... */}

      {/* Study Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Study Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map(item => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(item, 'in_progress')}
                    >
                      Start Studying
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Timer Overlay */}
      <AnimatePresence>
        {activeSession && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="bg-slate-900 text-white border-slate-800 shadow-2xl w-[400px]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-full animate-pulse">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">Studying</p>
                      <p className="text-sm font-bold truncate max-w-[150px]">
                        {activeSession.item.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-2xl font-mono font-bold tracking-wider">
                      {formatTime(seconds)}
                    </div>
                    <Button
                      onClick={handleStopStudy}
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                    >
                      <StopCircle className="h-4 w-4" />
                      Stop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SyllabusTracker;
