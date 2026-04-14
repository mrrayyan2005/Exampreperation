import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import {
  fetchAllExams,
  fetchUpcomingExams,
  createExam,
  updateExam,
  deleteExam
} from '@/redux/slices/examsSlice';
import { Exam } from '@/api/learningDomain/exams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Award,
  FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { subjectsApi } from '@/api/learningDomain/subjects';
import { differenceInDays } from 'date-fns';

const Exams = () => {
  const dispatch = useAppDispatch();
  const { allExams, upcomingExams, isLoading } = useAppSelector((state: RootState) => state.exams);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'all' | 'upcoming'>('upcoming');
  const [showResultModal, setShowResultModal] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ _id: string; name: string; color: string }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    examDate: '',
    duration: 120,
    location: '',
    totalMarks: 100,
    passingMarks: 40
  });

  useEffect(() => {
    loadExams();
    loadSubjects();
  }, [dispatch, viewMode]);

  const loadExams = () => {
    if (viewMode === 'all') {
      dispatch(fetchAllExams());
    } else {
      dispatch(fetchUpcomingExams(10));
    }
  };

  const loadSubjects = async () => {
    try {
      const subs = await subjectsApi.getAll();
      // API may return { data: [...] } or plain array
      const subsArray = Array.isArray(subs) ? subs : (Array.isArray((subs as any)?.data) ? (subs as any).data : []);
      setSubjects(subsArray);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]);
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      subjectId: exam.subjectId,
      examDate: new Date(exam.examDate).toISOString().slice(0, 16),
      duration: exam.duration,
      location: exam.location || '',
      totalMarks: exam.totalMarks || 100,
      passingMarks: exam.passingMarks || 40
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      await dispatch(deleteExam(id));
      loadExams();
    }
  };

  const handleCreate = () => {
    setEditingExam(undefined);
    const now = new Date();
    now.setHours(now.getHours() + 24, 0, 0, 0);
    setFormData({
      title: '',
      subjectId: '',
      examDate: now.toISOString().slice(0, 16),
      duration: 120,
      location: '',
      totalMarks: 100,
      passingMarks: 40
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingExam) {
      await dispatch(updateExam({
        id: editingExam._id,
        data: formData
      }));
    } else {
      await dispatch(createExam(formData));
    }

    setIsModalOpen(false);
    setEditingExam(undefined);
    loadExams();
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.color || '#3B82F6';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getDaysLeft = (dateStr: string) => {
    const days = differenceInDays(new Date(dateStr), new Date());
    if (days < 0) return { text: 'Passed', color: 'gray' };
    if (days === 0) return { text: 'Today', color: 'red' };
    if (days === 1) return { text: 'Tomorrow', color: 'orange' };
    if (days <= 7) return { text: `${days} Days Left`, color: 'yellow' };
    return { text: `${days} Days Left`, color: 'green' };
  };

  const examsToDisplay = viewMode === 'all' ? allExams : upcomingExams;
  const sortedExams = [...examsToDisplay].sort((a, b) =>
    new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><span className="text-primary">Exams</span></h1>
          <p className="text-muted-foreground">
            Track your upcoming tests and results
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            onClick={() => { setViewMode('all'); loadExams(); }}
          >
            All Exams
          </Button>
          <Button
            variant={viewMode === 'upcoming' ? 'default' : 'outline'}
            onClick={() => { setViewMode('upcoming'); loadExams(); }}
          >
            Upcoming
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Exam
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allExams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingExams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allExams.filter(e => e.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam List */}
      <div className="grid gap-4 md:grid-cols-2">
        {sortedExams.map((exam) => {
          const daysLeft = getDaysLeft(exam.examDate);
          const isUrgent = daysLeft.color === 'red' || daysLeft.color === 'orange';
          const subjectColor = getSubjectColor(exam.subjectId);

          return (
            <Card
              key={exam._id}
              className={`overflow-hidden border-l-4 hover:shadow-md transition-shadow ${exam.status === 'completed' ? 'opacity-70' : ''
                }`}
              style={{ borderLeftColor: subjectColor }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{exam.title}</h3>
                    {exam.status === 'completed' && <Award className="h-4 w-4 text-green-600" />}
                    {isUrgent && exam.status !== 'completed' && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <Badge variant={exam.status === 'completed' ? 'secondary' : 'default'}>
                    {exam.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: subjectColor }}></span>
                  <span className="text-sm text-muted-foreground">{getSubjectName(exam.subjectId)}</span>
                </div>

                <div className="space-y-2 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(exam.examDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Duration: {exam.duration} minutes
                  </div>
                  {exam.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {exam.location}
                    </div>
                  )}
                  {(exam.totalMarks || exam.passingMarks) && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Max: {exam.totalMarks} | Pass: {exam.passingMarks}
                    </div>
                  )}
                </div>

                {/* Days Left Badge */}
                {exam.status !== 'completed' && (
                  <div className="pt-2 border-t">
                    <Badge
                      variant="outline"
                      className={`text-${daysLeft.color === 'red' ? 'red' :
                          daysLeft.color === 'orange' ? 'orange' :
                            daysLeft.color === 'yellow' ? 'yellow' :
                              daysLeft.color === 'green' ? 'green' : 'gray'
                        }-600`}
                    >
                      {daysLeft.text}
                    </Badge>
                  </div>
                )}

                {/* Results Display */}
                {exam.result && exam.status === 'completed' && (
                  <div className="pt-2 border-t space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Results:</p>
                    <div className="flex justify-between text-sm">
                      <span>Marks Obtained:</span>
                      <span className="font-medium">{exam.result.marksObtained}/{exam.totalMarks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Percentage:</span>
                      <span className="font-medium">{exam.result.percentage}%</span>
                    </div>
                    {exam.result.grade && (
                      <div className="flex justify-between text-sm">
                        <span>Grade:</span>
                        <span className="font-medium text-lg">{exam.result.grade}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(exam)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(exam._id)} className="text-destructive">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {sortedExams.length === 0 && !isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-card/50">
            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No exams scheduled</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {viewMode === 'upcoming' ? 'No upcoming exams' : 'No exams found'}
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Exam
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Exam Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingExam ? 'Edit Exam' : 'New Exam'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Exam Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Midterm Exam"
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select value={formData.subjectId} onValueChange={(value) => setFormData({ ...formData, subjectId: value })}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject._id} value={subject._id}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></span>
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="examDate">Exam Date & Time *</Label>
              <Input
                id="examDate"
                type="datetime-local"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="duration">Duration (mins) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="300"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min="1"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="passingMarks">Passing Marks</Label>
                <Input
                  id="passingMarks"
                  type="number"
                  min="1"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: Number(e.target.value) })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingExam ? 'Update' : 'Create'} Exam
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Exams;