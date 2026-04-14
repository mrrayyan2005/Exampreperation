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
import { useAppDispatch } from '@/redux/hooks';
import { createSubject, updateSubject, fetchSubjects } from '@/redux/slices/subjectSlice';
import { Subject } from '@/api/subjectApi';

interface SubjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject?: Subject;
}

const COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#64748B', // Slate
];

const ICONS = [
    'book',
    'calculator',
    'flask',
    'globe',
    'music',
    'palette',
    'dumbbell',
    'code',
    'atom',
];

const SubjectFormModal = ({ isOpen, onClose, subject }: SubjectFormModalProps) => {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        color: '#3B82F6',
        instructor: '',
        icon: 'book',
    });

    useEffect(() => {
        if (subject) {
            setFormData({
                name: subject.name,
                color: subject.color || '#3B82F6',
                instructor: subject.instructor || '',
                icon: subject.icon || 'book',
            });
        } else {
            setFormData({
                name: '',
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                instructor: '',
                icon: 'book',
            });
        }
    }, [subject, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('====== SUBMIT SUBJECT FORM ======');
            console.log('Form data being submitted:', formData);
            console.log('Is editing:', !!subject);
            
            if (subject) {
                console.log('Updating subject:', subject._id);
                const result = await dispatch(updateSubject({ id: subject._id, data: formData })).unwrap();
                console.log('Subject updated:', result);
            } else {
                console.log('Creating new subject with data:', formData);
                const result = await dispatch(createSubject(formData)).unwrap();
                console.log('Subject created:', result);
                console.log('Refetching subjects...');
                // Refetch subjects after creating to ensure the list is updated
                const fetchResult = await dispatch(fetchSubjects());
                console.log('Subjects after refetch:', fetchResult);
            }
            onClose();
        } catch (error: any) {
            console.error('Failed to save subject:', error);
            alert(`Failed to save subject: ${error?.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{subject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Subject Name</Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Mathematics"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`w-6 h-6 rounded-full border-2 ${formData.color === color ? 'border-primary' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setFormData({ ...formData, color })}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon</Label>
                            <Select
                                value={formData.icon}
                                onValueChange={(value) => setFormData({ ...formData, icon: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select icon" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ICONS.map((icon) => (
                                        <SelectItem key={icon} value={icon}>
                                            {icon.charAt(0).toUpperCase() + icon.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructor">Instructor (Optional)</Label>
                        <Input
                            id="instructor"
                            value={formData.instructor}
                            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                            placeholder="e.g. Mr. Smith"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : subject ? 'Save Changes' : 'Create Subject'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SubjectFormModal;
