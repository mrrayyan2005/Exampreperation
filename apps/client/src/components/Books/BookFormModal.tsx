import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Book as BookIcon,
  Plus,
  X,
  Save,
  BookOpen,
  User,
  Hash,
  Calendar,
  Tag,
  Target,
  FileText,
  Layers,
  Upload,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Settings2,
  List
} from 'lucide-react';
import { syllabusApi } from '@/api/syllabusApi';
import { fetchSyllabus } from '@/redux/slices/syllabusSlice';
import { Book as BookType } from '@/redux/slices/bookSlice';
import { useAppDispatch } from '@/redux/hooks';
import { addBook, updateBook } from '@/redux/slices/bookSlice';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BookFormModalProps {
  book: BookType | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookFormModal = ({ book, isOpen, onClose }: BookFormModalProps) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [manualSyllabusText, setManualSyllabusText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    subject: 'Other',
    isbn: '',
    edition: '',
    publishedYear: new Date().getFullYear(),
    totalChapters: 0,
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    tags: [] as string[]
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        subject: book.subject || 'Other',
        isbn: book.isbn || '',
        edition: book.edition || '',
        publishedYear: book.publishedYear || new Date().getFullYear(),
        totalChapters: book.totalChapters || 10,
        notes: book.notes || '',
        priority: book.priority || 'medium',
        tags: book.tags || []
      });
    } else {
      setFormData({
        title: '',
        author: '',
        subject: 'Other',
        isbn: '',
        edition: '',
        publishedYear: new Date().getFullYear(),
        totalChapters: 0,
        notes: '',
        priority: 'medium',
        tags: []
      });
    }
    setTagInput('');
    setSyllabusFile(null);
    setManualSyllabusText('');
    setUploadStatus('idle');
  }, [book, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate only Title
    if (!formData.title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Book Title is required'
      });
      setIsLoading(false);
      return;
    }

    try {
      // Handle Manual Syllabus mapping to Chapters
      const now = new Date().toISOString();
      const manualChapters = manualSyllabusText
        .split('\n')
        .filter(line => line.trim())
        .map((line, index) => ({
          name: line.trim(),
          chapterNumber: index + 1,
          status: 'not_started' as const,
          priority: 'medium' as const,
          timeSpent: 0,
          estimatedTime: 0,
          notes: '',
          tests: [],
          revisions: [],
          linkedSyllabusItems: [],
          revisionStage: 0,
          isDueForRevision: false,
          createdAt: now,
          updatedAt: now
        }));

      const submitData = {
        ...formData,
        title: formData.title.trim(),
        subject: (formData.subject || 'Other').trim(),
        author: formData.author?.trim() || '',
        isbn: formData.isbn?.trim() || '',
        edition: formData.edition?.trim() || '',
        notes: formData.notes?.trim() || '',
        totalChapters: manualChapters.length > 0 ? manualChapters.length : (formData.totalChapters > 0 ? formData.totalChapters : 1),
        chapters: manualChapters.length > 0 ? manualChapters : undefined
      };

      if (book) {
        await dispatch(updateBook({ id: book.id, data: submitData }));
        toast({ title: 'Book updated successfully' });
      } else {
        await dispatch(addBook(submitData));

        // Handle Syllabus Creation (Upload or Manual)
        if (syllabusFile) {
          try {
            setUploadStatus('uploading');
            const uploadResponse = await syllabusApi.uploadSyllabus(syllabusFile);

            if (uploadResponse.success) {
              setUploadStatus('success');
              if (uploadResponse.data.rootId && submitData.subject && uploadResponse.data.subject !== submitData.subject) {
                await syllabusApi.updateSyllabusItem(uploadResponse.data.rootId, {
                  subject: submitData.subject
                });
              }
              dispatch(fetchSyllabus({}));
              toast({ title: 'Book and Syllabus added successfully' });
            }
          } catch (uploadError) {
            setUploadStatus('error');
            toast({
              variant: 'destructive',
              title: 'Book added, but syllabus upload failed'
            });
          }
        } else if (manualSyllabusText.trim()) {
          try {
            const rootItem = await syllabusApi.createSyllabusItem({
              title: submitData.subject,
              subject: submitData.subject,
              level: 1,
              priority: submitData.priority,
            });

            const topics = manualSyllabusText.split('\n').filter(line => line.trim());
            for (let i = 0; i < topics.length; i++) {
              await syllabusApi.createSyllabusItem({
                title: topics[i].trim(),
                subject: submitData.subject,
                level: 2,
                parentId: rootItem._id,
                priority: 'medium',
                order: i
              });
            }
            dispatch(fetchSyllabus({}));
            toast({ title: 'Book and Manual Syllabus added successfully' });
          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Book added, but syllabus creation failed'
            });
          }
        } else {
          toast({ title: 'Book added successfully' });
        }
      }
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: book ? 'Failed to update book' : 'Failed to add book',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const predefinedSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography',
    'Political Science', 'Economics', 'English Literature', 'Computer Science',
    'Engineering', 'Medical', 'Law', 'Philosophy', 'Psychology', 'UPSC Preparation', 'Other'
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none sm:rounded-2xl">
        <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 via-background to-background border-b relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles className="h-24 w-24 text-primary" />
          </div>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BookIcon className="h-6 w-6" />
            </div>
            {book ? 'Update Study Material' : 'Add New Book'}
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            {book ? 'Update your course materials and progress' : 'Simply enter the title to get started instantly'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-6 space-y-8"
          >
            {/* Essential Section */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                  What are you reading? <span className="text-primary">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary">
                    <BookOpen className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Organic Chemistry Vol. 1"
                    className="pl-12 h-14 text-lg bg-muted/30 border-2 transition-all focus:border-primary focus:bg-background rounded-xl"
                    required
                  />
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">Subject Category</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger className="h-11 bg-muted/30 border-muted rounded-xl">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">Study Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger className="h-11 bg-muted/30 border-muted rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500" /> Low</div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-yellow-500" /> Medium</div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-500" /> High</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>
            </div>

            {/* Collapsible Advanced Section */}
            <motion.div variants={itemVariants}>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced" className="border-none bg-muted/20 rounded-2xl px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Settings2 className="h-4 w-4" />
                      More Details (Optional)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="author">Author</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="author"
                            value={formData.author}
                            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                            placeholder="Author name..."
                            className="pl-9 h-10 bg-background"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalChapters">Total Chapters</Label>
                        <div className="relative">
                          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="totalChapters"
                            type="number"
                            value={formData.totalChapters === 0 ? '' : formData.totalChapters}
                            onChange={(e) => setFormData(prev => ({ ...prev, totalChapters: parseInt(e.target.value) || 0 }))}
                            placeholder="e.g. 15"
                            className="pl-9 h-10 bg-background"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="isbn">ISBN / Identity</Label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="isbn"
                            value={formData.isbn}
                            onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                            placeholder="ISBN number..."
                            className="pl-9 h-10 bg-background"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="publishedYear">Published Year</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="publishedYear"
                            type="number"
                            value={formData.publishedYear}
                            onChange={(e) => setFormData(prev => ({ ...prev, publishedYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                            className="pl-9 h-10 bg-background"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Tag className="h-4 w-4" /> Tags</Label>
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Study, MCQ, Important..."
                          className="h-10 bg-background"
                        />
                        <Button type="button" onClick={addTag} size="icon" variant="outline" className="h-10 w-10">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-3 py-1 rounded-lg gap-1">
                            {tag}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Key focus areas, exam importance..."
                        className="bg-background min-h-[80px]"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>

            {/* Syllabus Section - Only for new books */}
            {!book && (
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="font-semibold text-lg">Curriculum Blueprint</h3>
                </div>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="bg-muted/40 p-1 rounded-xl w-full max-w-sm mb-4">
                    <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Upload className="h-3.5 w-3.5 mr-2" /> Upload
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <List className="h-3.5 w-3.5 mr-2" /> Manual
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <div className="group relative border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 transition-all rounded-2xl p-8 text-center cursor-pointer">
                      <Input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => e.target.files && setSyllabusFile(e.target.files[0])}
                      />
                      <div className="flex flex-col items-center gap-3">
                        {syllabusFile ? (
                          <div className="animate-in zoom-in-50 duration-300">
                            <div className="p-3 rounded-2xl bg-green-500/10 text-green-600 mb-2">
                              <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <p className="font-semibold">{syllabusFile.name}</p>
                            <Button variant="ghost" size="sm" className="mt-2" onClick={(e) => {
                              e.stopPropagation();
                              setSyllabusFile(null);
                            }}>Change File</Button>
                          </div>
                        ) : (
                          <>
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                              <Upload className="h-8 w-8" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">Drop your syllabus</p>
                              <p className="text-muted-foreground text-sm">PDF, JPEG, or PNG supported</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="manual">
                    <Textarea
                      placeholder="Introduction&#10;Reaction Mechanisms&#10;Functional Groups..."
                      className="min-h-[120px] bg-muted/20 border-none rounded-2xl p-4 font-mono text-sm focus-visible:ring-primary/20"
                      value={manualSyllabusText}
                      onChange={(e) => setManualSyllabusText(e.target.value)}
                    />
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </motion.div>

          {/* Sticky Actions */}
          <div className="sticky bottom-0 p-6 bg-background/80 backdrop-blur-md border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl hover:bg-muted font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl px-8 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-11"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {book ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {book ? 'Save Changes' : 'Add Book'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookFormModal;
