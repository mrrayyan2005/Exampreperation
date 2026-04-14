
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchSubjects, deleteSubject } from '@/redux/slices/subjectSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Library } from 'lucide-react';
import SubjectFormModal from '@/components/Subjects/SubjectFormModal';
import { Subject } from '@/api/subjectApi';

const Subjects = () => {
    const dispatch = useAppDispatch();
    const { subjects, loading } = useAppSelector((state) => state.subjects);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | undefined>(undefined);

    useEffect(() => {
        dispatch(fetchSubjects());
    }, [dispatch]);

    const handleEdit = (subject: Subject) => {
        setEditingSubject(subject);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            await dispatch(deleteSubject(id));
        }
    };

    const handleCreate = () => {
        setEditingSubject(undefined);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        // Refetch subjects when modal closes to ensure UI is up to date
        setTimeout(() => {
            dispatch(fetchSubjects());
        }, 100);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight"><span className="text-primary">Subjects</span></h1>
                    <p className="text-muted-foreground">
                        Manage your academic subjects and courses
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                    <Card key={subject._id} className="overflow-hidden border-l-4" style={{ borderLeftColor: subject.color }}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">{subject.name}</h3>
                                    {subject.instructor && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            Instructor: {subject.instructor}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(subject)}
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(subject._id)}
                                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {subjects.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-card/50">
                        <Library className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No subjects yet</h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                            Add your subjects to start tracking your schedule, assignments, and exams.
                        </p>
                        <Button onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Subject
                        </Button>
                    </div>
                )}
            </div>

            <SubjectFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                subject={editingSubject}
            />
        </div>
    );
};

export default Subjects;
