import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost, fetchChannel } from '@/api/community';
import { X, Plus, Hash, Type, Sparkles, Ghost, TrendingUp, ChevronLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const POST_TYPES = [
  {
    key: 'question',
    label: 'Question',
    icon: '❓',
    desc: 'Ask a clear exam question',
    color: 'from-blue-500/20 to-blue-600/10 text-blue-600 border-blue-500/30',
    ring: 'focus:ring-blue-500/30',
  },
  {
    key: 'discussion',
    label: 'Discussion',
    icon: '💬',
    desc: 'Start a conversation',
    color: 'from-purple-500/20 to-purple-600/10 text-purple-600 border-purple-500/30',
    ring: 'focus:ring-purple-500/30',
  },
  {
    key: 'resource',
    label: 'Resource',
    icon: '📁',
    desc: 'Share notes or PDFs',
    color: 'from-green-500/20 to-green-600/10 text-green-600 border-green-500/30',
    ring: 'focus:ring-green-500/30',
  },
  {
    key: 'strategy',
    label: 'Strategy',
    icon: '🎯',
    desc: 'Share your plan',
    color: 'from-orange-500/20 to-orange-600/10 text-orange-600 border-orange-500/30',
    ring: 'focus:ring-orange-500/30',
  },
  {
    key: 'milestone',
    label: 'Milestone',
    icon: '🏆',
    desc: 'Celebrate wins',
    color: 'from-yellow-500/20 to-yellow-600/10 text-yellow-600 border-yellow-500/30',
    ring: 'focus:ring-yellow-500/30',
  },
  {
    key: 'poll',
    label: 'Poll',
    icon: '📊',
    desc: 'Get feedback',
    color: 'from-pink-500/20 to-pink-600/10 text-pink-600 border-pink-500/30',
    ring: 'focus:ring-pink-500/30',
  },
];

const SUGGESTED_TAGS = [
  'doubt', 'strategy', 'notes', 'resources', 'pyq',
  'mock-test', 'current-affairs', 'formula', 'important',
];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChannelSlug?: string;
  onSuccess?: (postId: string) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  defaultChannelSlug,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const customTypeInputRef = useRef<HTMLInputElement>(null);
  const selectedChannelSlug = defaultChannelSlug || '';
  
  // New split-step state
  const [step, setStep] = useState<1 | 2>(1);

  // Shared
  const [selectedSubchannelId, setSelectedSubchannelId] = useState('');
  const [postType, setPostType] = useState('discussion');
  const [customPostType, setCustomPostType] = useState('');
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  // Question-specific structured fields
  const [examName, setExamName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  const [questionSource, setQuestionSource] = useState('');
  const [whatTried, setWhatTried] = useState('');
  const [whereStuck, setWhereStuck] = useState('');
  const [examDate, setExamDate] = useState('');
  // Resource-specific structured fields
  const [resourceType, setResourceType] = useState<'book' | 'notes' | 'video' | 'website' | ''>('');
  const [resourceLevel, setResourceLevel] = useState<'beginner' | 'intermediate' | 'advanced' | ''>('');
  const [resourceExamRelevance, setResourceExamRelevance] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDays, setPollDays] = useState(3);
  // Gamification
  const [bounty, setBounty] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { user } = useAppSelector((s) => s.auth);

  const { data: channelData } = useQuery({
    queryKey: ['channel', selectedChannelSlug],
    queryFn: () => fetchChannel(selectedChannelSlug).then((r) => r.data.data),
    enabled: !!selectedChannelSlug,
  });

  const subchannels: Array<{ _id: string; name: string }> = channelData?.subchannels || [];

  const resetForm = useCallback(() => {
    setStep(1);
    setSelectedSubchannelId('');
    setPostType('discussion');
    setCustomPostType('');
    setShowCustomTypeInput(false);
    setTopic('');
    setTitle('');
    setBody('');
    setSelectedTags([]);
    setCustomTagInput('');
    setExamName('');
    setSubjectName('');
    setChapterName('');
    setDifficulty('');
    setQuestionSource('');
    setWhatTried('');
    setWhereStuck('');
    setResourceType('');
    setResourceLevel('');
    setResourceExamRelevance('');
    setExamDate('');
    setPollOptions(['', '']);
    setPollDays(3);
    setBounty(0);
    setIsAnonymous(false);
  }, []);

  useEffect(() => {
    if (subchannels.length > 0 && !selectedSubchannelId) {
      queueMicrotask(() => setSelectedSubchannelId(''));
    }
  }, [subchannels.length, selectedSubchannelId]);

  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => resetForm());
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const createMutation = useMutation({
    mutationFn: () => {
      const metaTags: string[] = [];
      const pushTag = (val?: string) => {
        const normalized = val?.trim().toLowerCase();
        if (normalized) metaTags.push(normalized);
      };

      if (postType === 'question') {
        pushTag(examName);
        pushTag(subjectName);
        pushTag(chapterName);
        pushTag(difficulty);
        pushTag(questionSource);
      }

      if (postType === 'resource') {
        pushTag(resourceType);
        pushTag(resourceLevel);
        pushTag(resourceExamRelevance);
      }

      const tags = Array.from(new Set([...selectedTags, ...metaTags]));
      const enrichedBody = postType === 'question'
        ? [body, whatTried && `\n\nWhat I tried:\n${whatTried}`, whereStuck && `\n\nWhere I'm stuck:\n${whereStuck}`].filter(Boolean).join('')
        : body;

      return createPost({
        channelId: channelData?._id || '',
        subchannelId: selectedSubchannelId || undefined,
        type: postType === 'custom' ? customPostType.toLowerCase().replace(/\s+/g, '-') : postType,
        title,
        body: enrichedBody,
        tags,
        chapter: chapterName || undefined,
        difficulty: difficulty || undefined,
        questionSource: questionSource || undefined,
        whatITried: whatTried || undefined,
        whereImStuck: whereStuck || undefined,
        topic: topic || undefined,
        resourceType: resourceType || undefined,
        level: resourceLevel || undefined,
        examRelevance: resourceExamRelevance ? [resourceExamRelevance] : undefined,
        examDate: examDate || undefined,
        poll: postType === 'poll' ? {
          options: pollOptions.filter((o) => o.trim() !== '').map((text) => ({ text })),
          expiresAt: new Date(Date.now() + pollDays * 24 * 60 * 60 * 1000).toISOString(),
        } : undefined,
        bounty: bounty || 0,
        isAnonymous: !!isAnonymous,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['channel-feed', selectedChannelSlug] });
      onSuccess?.(res.data.data._id);
      onClose();
      resetForm();
    },
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 5)
    );
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
      setCustomTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addCustomTag();
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handlePostTypeSelect = (key: string) => {
    if (key === 'custom') {
      setShowCustomTypeInput(true);
      setPostType('custom');
      setTimeout(() => customTypeInputRef.current?.focus(), 100);
    } else {
      setShowCustomTypeInput(false);
      setPostType(key);
      setStep(2); // Auto advance to step 2 for built-in types
    }
  };

  const isFormValid = () => {
    const hasTitle = title.trim().length > 0;
    const hasValidPostType = postType !== 'custom' || customPostType.trim().length > 0;
    const hasValidPoll = postType !== 'poll' || pollOptions.filter(o => o.trim()).length >= 2;
    const hasValidSubchannel = subchannels.length === 0 || selectedSubchannelId !== '' || true;
    const hasValidQuestionFields = postType !== 'question' || (examName.trim() && subjectName.trim());
    return hasTitle && hasValidPostType && hasValidPoll && hasValidSubchannel && hasValidQuestionFields && !createMutation.isPending;
  };

  if (!isOpen) return null;

  const currentPostType = POST_TYPES.find(t => t.key === postType);

  // Animation variants
  const slideVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' as const } },
    exit: { x: -50, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' as const } },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 perspective-1000">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/60 backdrop-blur-2xl transition-all duration-500 pointer-events-auto"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex flex-col sm:items-center justify-end sm:justify-center p-0 sm:p-4 pointer-events-none z-50">
        <motion.div
          initial={{ y: 50, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 50, scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          ref={modalRef}
          className="w-full sm:w-full sm:max-w-3xl bg-card/95 sm:backdrop-blur-3xl sm:rounded-[2.5rem] rounded-t-[2.5rem] border border-white/15 dark:border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.4)] max-h-[92vh] sm:max-h-[88vh] flex flex-col pointer-events-auto relative overflow-hidden ring-1 ring-white/10"
        >
          {/* Subtle noise/gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 sm:px-10 sm:pt-8 sm:pb-5 border-b border-border/40 bg-transparent z-10 shrink-0 relative">
            <div className="flex items-center gap-5 flex-1">
              {step === 2 && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => setStep(1)}
                  className="rounded-full p-2.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 hover:-translate-x-1"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
              )}
              
              <AnimatePresence mode="popLayout">
                {step === 2 ? (
                  <motion.div
                    key="step2-header"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-row items-center gap-4"
                  >
                    <div className={cn(
                      'h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner border border-white/20 bg-gradient-to-br',
                      currentPostType?.color || 'from-primary/20 to-primary/5 text-primary'
                    )}>
                      {postType === 'custom' ? '✨' : currentPostType?.icon}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Create {postType === 'custom' ? 'Custom Post' : currentPostType?.label}
                      </h2>
                      <p className="text-sm font-medium text-muted-foreground mt-0.5">
                        {currentPostType?.desc || 'Create your own format'}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step1-header"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-2">
                       <Sparkles className="h-3 w-3 text-primary" />
                       <span className="text-[10px] sm:text-xs font-bold text-primary tracking-widest uppercase">Select Post Category</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                      What do you want to share?
                    </h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={onClose}
              className="rounded-full p-3 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 ml-4 hover:rotate-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 sm:px-10 sm:py-8 overflow-y-auto flex-1 custom-scrollbar z-10 relative">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {POST_TYPES.map((t) => (
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        key={t.key}
                        onClick={() => handlePostTypeSelect(t.key)}
                        className={cn(
                          'group flex items-start gap-4 rounded-3xl border border-white/10 dark:border-white/5 p-5 text-left transition-all duration-300 relative overflow-hidden shadow-sm backdrop-blur-xl',
                          postType === t.key
                            ? cn('ring-2 ring-primary bg-gradient-to-br shadow-[0_8px_30px_rgb(0,0,0,0.12)]', t.color)
                            : 'bg-muted/30 hover:bg-muted/50 hover:border-primary/30'
                        )}
                      >
                        <div className={cn('flex items-center justify-center text-3xl h-14 w-14 rounded-2xl bg-background/50 shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform duration-300', postType === t.key ? 'opacity-100' : 'opacity-80 group-hover:opacity-100')}>
                           {t.icon}
                        </div>
                        <div className="flex-1 mt-1">
                          <div className={cn(
                            "font-black text-lg sm:text-xl mb-1 transition-colors",
                            postType === t.key ? 'text-foreground' : 'text-foreground/90 group-hover:text-foreground'
                          )}>
                            {t.label}
                          </div>
                          <div className={cn(
                            'text-[13px] font-medium leading-relaxed transition-colors',
                            postType === t.key ? 'text-foreground/80' : 'text-muted-foreground group-hover:text-muted-foreground/80'
                          )}>
                            {t.desc}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                    
                    {/* Custom Type Option */}
                    <motion.div
                       whileHover={{ scale: 1.02, y: -2 }}
                       className="relative"
                    >
                      <button
                        onClick={() => handlePostTypeSelect('custom')}
                        className={cn(
                          'w-full h-full group flex items-start gap-4 rounded-3xl border border-white/10 border-dashed p-5 text-left transition-all duration-300 relative overflow-hidden backdrop-blur-xl',
                          postType === 'custom'
                            ? 'ring-2 ring-primary bg-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                            : 'bg-muted/20 hover:bg-muted/40 hover:border-primary/40'
                        )}
                      >
                        <div className="flex flex-col flex-1 h-full"> 
                          <div className="font-black text-lg sm:text-xl mb-1 text-foreground/80 group-hover:text-primary transition-colors flex items-center gap-2">
                             <Sparkles className="h-5 w-5"/> Custom
                          </div>
                          {!showCustomTypeInput ? (
                             <div className="text-[13px] font-medium leading-relaxed text-muted-foreground">
                               Create your own format
                             </div>
                          ) : (
                             <div className="mt-2 w-full" onClick={e => e.stopPropagation()}>
                                <input
                                  ref={customTypeInputRef}
                                  value={customPostType}
                                  onChange={(e) => setCustomPostType(e.target.value)}
                                  placeholder="e.g., Announcement"
                                  className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                                />
                             </div>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  </div>
                  
                  {postType === 'custom' && showCustomTypeInput && customPostType.trim() && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end pt-4"
                    >
                      <button
                        onClick={() => setStep(2)}
                        className="rounded-[1.25rem] bg-primary text-primary-foreground px-8 py-4 text-base font-black tracking-wide hover:bg-primary/90 hover:scale-[1.02] shadow-[0_8px_30px_rgba(var(--primary),0.3)] flex items-center gap-2"
                      >
                         Continue <ArrowRight className="h-5 w-5" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-7 sm:space-y-9"
                >
                  {/* Subchannels */}
                  {subchannels.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Choose Topic
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedSubchannelId('')}
                          className={cn(
                            'px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm border',
                            selectedSubchannelId === ''
                              ? 'bg-primary text-primary-foreground border-transparent ring-4 ring-primary/20 shadow-primary/20 scale-105'
                              : 'bg-muted/30 border-white/5 hover:bg-muted/80 text-foreground/80 hover:border-black/10 dark:hover:border-white/10'
                          )}
                        >
                          General
                        </button>
                        {subchannels.map((s: any) => (
                          <button
                            key={s._id}
                            onClick={() => setSelectedSubchannelId(s._id)}
                            className={cn(
                              'px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm border',
                              selectedSubchannelId === s._id
                                ? 'bg-primary text-primary-foreground border-transparent ring-4 ring-primary/20 shadow-primary/20 scale-105'
                                : 'bg-muted/30 border-white/5 hover:bg-muted/80 text-foreground/80 hover:border-black/10 dark:hover:border-white/10'
                            )}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Context-aware Title */}
                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                      <span>Title <span className="text-destructive">*</span></span>
                      {postType === 'question' && (
                        <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full lowercase tracking-widest font-bold">
                          exam · subject · chapter
                        </span>
                      )}
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={
                        postType === 'question'
                          ? 'e.g. NEET 2026 | Physics | Doubt in electrostatics'
                          : postType === 'resource'
                          ? 'e.g. JEE PYQ booklet for Organic Chemistry'
                          : postType === 'strategy'
                          ? 'e.g. 90-day plan for UPSC Prelims'
                          : 'A brilliant title for your post...'
                      }
                      maxLength={300}
                      className="w-full rounded-[1.5rem] border border-white/10 dark:border-white/5 bg-muted/20 px-6 py-5 text-lg sm:text-xl font-bold focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/40 shadow-inner"
                    />
                  </div>

                  {/* Question Fields */}
                  {postType === 'question' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold pl-1">Exam <span className="text-destructive">*</span></label>
                          <input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g. NEET, JEE" className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold pl-1">Subject <span className="text-destructive">*</span></label>
                          <input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Physics" className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm font-semibold pl-1">Chapter / Topic</label>
                          <input value={chapterName} onChange={(e) => setChapterName(e.target.value)} placeholder="e.g. Optics" className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold pl-1">Difficulty</label>
                          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">Select</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Resource Fields */}
                  {postType === 'resource' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold pl-1">Format</label>
                          <select value={resourceType} onChange={(e) => setResourceType(e.target.value as any)} className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">Select</option>
                            <option value="book">Book</option>
                            <option value="notes">Notes</option>
                            <option value="video">Video</option>
                            <option value="website">Website</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold pl-1">Level</label>
                          <select value={resourceLevel} onChange={(e) => setResourceLevel(e.target.value as any)} className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">Select</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold pl-1">Target Exam</label>
                          <input value={resourceExamRelevance} onChange={(e) => setResourceExamRelevance(e.target.value)} placeholder="e.g. JEE Mains" className="w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Body Details */}
                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      {postType === 'question' ? 'Elaborate your doubt' : 'Details & Context'}
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full lowercase">Optional</span>
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder={postType === 'question' ? 'What have you tried so far? Where exactly are you stuck?' : 'Add more context, references, or links...'}
                      rows={5}
                      className="w-full rounded-[1.5rem] border border-white/10 dark:border-white/5 bg-muted/20 px-6 py-5 text-[15px] resize-none focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium leading-relaxed placeholder:text-muted-foreground/40 shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Tags */}
                    <div className="space-y-4">
                      <label className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Hash className="h-4 w-4" /> Tags
                        <span className="text-[10px] bg-muted/80 px-2 py-0.5 rounded-full lowercase">Max 5</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1 group">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <input
                            ref={tagInputRef}
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Add tag..."
                            disabled={selectedTags.length >= 5}
                            className="w-full rounded-2xl border border-border/50 bg-muted/20 pl-10 pr-4 py-3.5 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50 font-bold"
                          />
                        </div>
                        <button onClick={addCustomTag} disabled={!customTagInput.trim() || selectedTags.length >= 5} className="px-5 rounded-2xl bg-muted/50 text-foreground font-bold hover:bg-muted transition-colors disabled:opacity-50">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                          {selectedTags.map((tag) => (
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                              key={tag}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold shadow-sm"
                            >
                              #{tag}
                              <button onClick={() => removeTag(tag)} className="hover:text-destructive hover:scale-110 transition-all"><X className="h-3 w-3" /></button>
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Gamification Settings */}
                    <div className="space-y-4">
                      <label className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Preferences
                      </label>
                      <div className="space-y-3 rounded-[1.5rem] border border-border/50 bg-muted/10 p-5 shadow-inner">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-500/10 flex items-center justify-center">
                               <Ghost className="h-4 w-4 text-slate-500" />
                            </div>
                            <span className="text-sm font-bold text-foreground/80">Post Anonymously</span>
                          </div>
                          <button onClick={() => setIsAnonymous(!isAnonymous)} className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ring-2 ring-transparent focus:ring-primary/40", isAnonymous ? "bg-primary shadow-lg shadow-primary/20" : "bg-muted-foreground/30")}>
                            <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm", isAnonymous ? "translate-x-6" : "translate-x-1")} />
                          </button>
                        </div>
                        {postType === 'question' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                   <TrendingUp className="h-4 w-4 text-orange-500" />
                                </div>
                                <span className="text-sm font-bold text-foreground/80">Karma Bounty</span>
                                <span className="text-xs font-black text-orange-600 bg-orange-500/10 px-2 py-1 rounded-full">{bounty}</span>
                              </div>
                            </div>
                            <input type="range" min="0" max={Math.min(500, (user as any)?.progressStats?.karma || 0)} step="10" value={bounty} onChange={(e) => setBounty(parseInt(e.target.value))} className="w-full h-2 bg-muted/50 rounded-full appearance-none cursor-pointer accent-orange-500" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="pt-6 sticky bottom-0 bg-gradient-to-t from-card via-card/95 to-transparent pb-4 mt-auto"
                  >
                    <button
                      disabled={!isFormValid()}
                      onClick={() => createMutation.mutate()}
                      className={cn(
                        'w-full rounded-[1.5rem] bg-primary text-primary-foreground py-4 text-lg font-black tracking-wide hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(var(--primary),0.3)]',
                        !isFormValid() && 'opacity-50 cursor-not-allowed hover:scale-100 shadow-none saturate-50'
                      )}
                    >
                      {createMutation.isPending ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          {isFormValid() ? <CheckCircle2 className="h-6 w-6" /> : <Sparkles className="h-5 w-5 opacity-50"/>}
                          Publish Post
                        </>
                      )}
                    </button>
                    {createMutation.isError && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm font-bold text-destructive text-center mt-3">
                        Failed to create post. Please try again.
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};