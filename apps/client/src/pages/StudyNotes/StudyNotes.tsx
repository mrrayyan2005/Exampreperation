import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, FileText, Trash2, MoreHorizontal, Loader2, Pin, Archive, Clock, Hash, ChevronRight } from "lucide-react";
import { BlockNoteEditor } from "@/components/Notes/BlockNoteEditor";
import { cn } from "@/lib/utils";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FlexibleBlock } from "@/components/Notes/DocumentEditor";

interface NoteType {
  _id: string;
  title: string;
  content?: { blocks: FlexibleBlock[] };
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  updatedAt: string;
  createdAt: string;
}

export default function StudyNotes() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [showArchived]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const params = { archived: showArchived ? 'true' : 'false' };
      const response = await axiosInstance.get('/notes', { params });
      
      if (response.data.success) {
        const mappedNotes = response.data.data.map((note: NoteType) => ({
          ...note,
          isPinned: note.isPinned || false,
          isArchived: note.isArchived || false,
        }));
        setNotes(mappedNotes);
        
        // Select first note if none selected
        if (mappedNotes.length > 0 && !selectedNoteId) {
          const firstUnarchived = mappedNotes.find((n: NoteType) => !n.isArchived);
          setSelectedNoteId(firstUnarchived?._id || mappedNotes[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort: pinned first, then by updatedAt
    return filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery]);

  const selectedNote = notes.find(n => n._id === selectedNoteId) || null;

  const handleCreateNote = async () => {
    try {
      setIsCreating(true);
      const newNoteData = {
        title: "Untitled Note",
        content: { blocks: [] },
        tags: [],
      };

      const response = await axiosInstance.post('/notes', newNoteData);
      if (response.data.success) {
        const createdNote = response.data.data;
        setNotes([createdNote, ...notes]);
        setSelectedNoteId(createdNote._id);
        toast.success("Note created");
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(`/notes/${id}`);
      const updatedNotes = notes.filter(n => n._id !== id);
      setNotes(updatedNotes);
      if (selectedNoteId === id) {
        setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0]._id : null);
      }
      toast.success("Note deleted");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleUpdateNote = async (updatedNote: Partial<NoteType> & { _id: string }) => {
    // Optimistic update
    setNotes(notes.map(n => n._id === updatedNote._id ? { ...n, ...updatedNote } : n));

    try {
      await axiosInstance.put(`/notes/${updatedNote._id}`, {
        title: updatedNote.title,
        content: updatedNote.content,
        tags: updatedNote.tags
      });
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to save changes");
    }
  };

  const handleTogglePin = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await axiosInstance.post(`/notes/${noteId}/pin`);
      if (response.data.success) {
        setNotes(notes.map(n => 
          n._id === noteId ? { ...n, isPinned: response.data.data.isPinned } : n
        ));
        toast.success(response.data.data.isPinned ? "Note pinned" : "Note unpinned");
      }
    } catch (error) {
      console.error("Failed to toggle pin:", error);
      toast.error("Failed to update note");
    }
  };

  const handleToggleArchive = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await axiosInstance.post(`/notes/${noteId}/archive`);
      if (response.data.success) {
        const isArchived = response.data.data.isArchived;
        setNotes(notes.map(n => 
          n._id === noteId ? { ...n, isArchived, isPinned: isArchived ? false : n.isPinned } : n
        ));
        toast.success(isArchived ? "Note archived" : "Note restored");
        
        if (isArchived && selectedNoteId === noteId) {
          const remainingNotes = notes.filter(n => n._id !== noteId && !n.isArchived);
          setSelectedNoteId(remainingNotes.length > 0 ? remainingNotes[0]._id : null);
        }
      }
    } catch (error) {
      console.error("Failed to toggle archive:", error);
      toast.error("Failed to update note");
    }
  };

  const getNotePreview = (note: NoteType) => {
    if (!note.content?.blocks || note.content.blocks.length === 0) {
      return "No content";
    }
    const textBlocks = note.content.blocks.filter(
      (b: any) => b.type === 'paragraph' || b.type === 'text'
    );
    if (textBlocks.length === 0) return "No content";
    
    const firstBlock = textBlocks[0];
    let preview = '';
    if (typeof firstBlock.content === 'string') {
      preview = firstBlock.content;
    } else if (Array.isArray(firstBlock.content)) {
      preview = firstBlock.content.map((c: any) =>
        typeof c === 'string' ? c : c.text || ''
      ).join('');
    }
    return preview.slice(0, 60) + (preview.length > 60 ? '...' : '') || "Empty";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar - Minimal Design */}
      <aside className="w-80 border-r border-border/50 flex flex-col bg-muted/20">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-sm font-semibold text-foreground/80">Notes</h1>
            <Button
              onClick={handleCreateNote}
              size="sm"
              className="h-8 px-3 text-xs bg-foreground text-background hover:bg-foreground/90"
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5 mr-1.5" />
              )}
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-8 h-9 text-sm bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3">
            <button
              onClick={() => setShowArchived(false)}
              className={cn(
                "flex-1 h-7 text-xs font-medium rounded-md transition-colors",
                !showArchived
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={cn(
                "flex-1 h-7 text-xs font-medium rounded-md transition-colors",
                showArchived
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/60">
                  {searchQuery ? "No matching notes" : "No notes yet"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleCreateNote}
                    variant="ghost"
                    className="mt-3 text-xs h-8"
                    size="sm"
                  >
                    Create your first note
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note._id}
                    layoutId={note._id}
                    onClick={() => setSelectedNoteId(note._id)}
                    className={cn(
                      "group relative px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                      selectedNoteId === note._id
                        ? "bg-background shadow-sm border border-border/50"
                        : "hover:bg-background/50 border border-transparent"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {note.isPinned && (
                        <Pin className="h-3 w-3 text-amber-500 fill-amber-500 mt-1 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-sm font-medium truncate",
                          selectedNoteId === note._id ? "text-foreground" : "text-foreground/70"
                        )}>
                          {note.title || "Untitled Note"}
                        </h3>
                        <p className="text-xs text-muted-foreground/60 line-clamp-1 mt-0.5">
                          {getNotePreview(note)}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-muted-foreground/40">
                            {formatDate(note.updatedAt)}
                          </span>
                          {note.tags.length > 0 && (
                            <span className="text-[10px] text-muted-foreground/40 flex items-center gap-0.5">
                              <Hash className="h-2.5 w-2.5" />
                              {note.tags.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={(e) => handleTogglePin(note._id, e as React.MouseEvent)} className="text-xs">
                          <Pin className="mr-2 h-3.5 w-3.5" />
                          {note.isPinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleToggleArchive(note._id, e as React.MouseEvent)} className="text-xs">
                          <Archive className="mr-2 h-3.5 w-3.5" />
                          {note.isArchived ? "Restore" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteNote(note._id, e as React.MouseEvent)}
                          className="text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Editor Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {selectedNote ? (
          <>
            {/* Breadcrumb */}
            <div className="h-12 border-b border-border/50 flex items-center px-6">
              <nav className="flex items-center text-sm text-muted-foreground/60">
                <span>Notes</span>
                <ChevronRight className="h-3.5 w-3.5 mx-2" />
                <span className="text-foreground/80 truncate max-w-md">
                  {selectedNote.title || "Untitled Note"}
                </span>
              </nav>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto py-8 px-8">
                <BlockNoteEditor
                  key={selectedNote._id}
                  document={selectedNote}
                  onDocumentChange={handleUpdateNote}
                  onCreateNewNote={handleCreateNote}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="h-10 border-t border-border/50 flex items-center justify-between px-6 text-xs text-muted-foreground/50">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Edited {formatDate(selectedNote.updatedAt)}
                </span>
                {selectedNote.tags.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3 w-3" />
                    {selectedNote.tags.join(', ')}
                  </span>
                )}
              </div>
              <span>{selectedNote.content?.blocks?.length || 0} blocks</span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40">
            <FileText className="h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-base font-medium text-foreground/60 mb-1">Select a note</h3>
            <p className="text-sm text-muted-foreground/40">Choose a note from the sidebar or create a new one</p>
            <Button
              onClick={handleCreateNote}
              variant="outline"
              className="mt-6"
              size="sm"
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Note
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}