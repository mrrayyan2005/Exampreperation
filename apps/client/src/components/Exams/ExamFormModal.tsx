
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createExam, updateExam } from '@/redux/slices/schoolExamSlice';
import { fetchSubjects } from '@/redux/slices/subjectSlice';
import { SchoolExam } from '@/api/schoolExamApi';

interface ExamFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    exam?: SchoolExam;
}

const ExamFormModal = ({ isOpen, onClose, exam }: ExamFormModalProps) => {
    const dispatch = useAppDispatch();
    const { subjects } = useAppSelector((state) => state.subjects);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        subject: '',
        date: '',
        startTime: '09:00',
        duration: 60,
        location: '',
        seat: '',
        notes: '',
    });

    useEffect(() => {
        dispatch(fetchSubjects());
    }, [dispatch]);

    useEffect(() => {
        if (exam) {
            setFormData({
                subject: (exam.subject as any)._id || exam.subject,
                date: new Date(exam.date).toISOString().split('T')[0],
                startTime: exam.startTime,
                duration: exam.duration,
                location: exam.location || '',
                seat: exam.seat || '',
                notes: exam.notes || '',
            });
        } else {
            setFormData({
                subject: '',
                date: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                duration: 60,
                location: '',
                seat: '',
                notes: '',
            });
        }
    }, [exam, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject) return;

        setLoading(true);

        try {
            if (exam) {
                await dispatch(updateExam({ id: exam._id, data: formData })).unwrap();
            } else {
                await dispatch(createExam(formData)).unwrap();
            }
            onClose();
        } catch (error) {
            console.error('Failed to save exam:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{exam ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select
                            value={formData.subject}
                            onValueChange={(value) => setFormData({ ...formData, subject: value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject._id} value={subject._id}>
                                        {subject.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                type="date"
                                id="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                type="time"
                                id="startTime"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                                type="number"
                                id="duration"
                                min="1"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Room (Optional)</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="seat">Seat (Optional)</Label>
                        <Input
                            id="seat"
                            value={formData.seat}
                            onChange={(e) => setFormData({ ...formData, seat: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Topics / Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Topics covered in this exam..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : exam ? 'Save Changes' : 'Schedule Exam'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ExamFormModal;
