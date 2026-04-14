import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChannel } from '@/api/community';
import { X, Globe, Lock, GraduationCap, BookOpen, MessageSquare, Beaker } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANNEL_TYPES = [
  { key: 'exam', label: 'Exam', icon: <GraduationCap className="h-4 w-4" /> },
  { key: 'subject', label: 'Subject', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'college', label: 'College', icon: <Globe className="h-4 w-4" /> },
  { key: 'language', label: 'Language', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'standard', label: 'Standard', icon: <Beaker className="h-4 w-4" /> },
];

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('exam');

  const mutation = useMutation({
    mutationFn: (data: any) => createChannel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel created successfully!');
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setType('exam');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create channel');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({ name, description, type });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Create a Channel</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Channel Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. UPSC Aspirants 2026"
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              required
            />
            <p className="text-[10px] text-muted-foreground ml-1">
              Slug will be: community/channel/{name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CHANNEL_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                    type === t.key
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted/20 border-border text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Channel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
