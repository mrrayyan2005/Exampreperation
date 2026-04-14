import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FileText,
  Plus,
  Search,
  Hash,
  Folder,
  Pin,
  Archive,
  Trash2,
  Maximize,
  Clock,
  BarChart3,
  Tags,
  Keyboard,
} from "lucide-react";

interface Note {
  _id: string;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  folderId?: string;
  tags: string[];
  updatedAt?: string;
}

interface Folder {
  _id: string;
  name: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  folders: Folder[];
  tags: Array<{ name: string; count: number }>;
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onToggleFocusMode: () => void;
  onShowStatistics: () => void;
  onShowTagManager: () => void;
  onToggleArchive: () => void;
  showArchived: boolean;
  onSetShowArchived: (show: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  notes,
  folders,
  tags,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onToggleFocusMode,
  onShowStatistics,
  onShowTagManager,
  onToggleArchive,
  showArchived,
  onSetShowArchived,
}) => {
  const [search, setSearch] = useState("");

  // Reset search when palette opens
  useEffect(() => {
    if (isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // Filter active notes
  const activeNotes = useMemo(() =>
    notes.filter(n => !n.isArchived),
    [notes]
  );

  // Filter archived notes
  const archivedNotes = useMemo(() =>
    notes.filter(n => n.isArchived),
    [notes]
  );

  // Filter pinned notes
  const pinnedNotes = useMemo(() =>
    activeNotes.filter(n => n.isPinned),
    [activeNotes]
  );

  // Recent notes (last 5 updated)
  const recentNotes = useMemo(() =>
    [...activeNotes]
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .slice(0, 5),
    [activeNotes]
  );

  // Search results
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const query = search.toLowerCase();
    return activeNotes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.tags.some(t => t.toLowerCase().includes(query))
    );
  }, [search, activeNotes]);

  const handleSelect = (callback: () => void) => {
    callback();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl z-50"
          >
            <Command className="rounded-lg border shadow-2xl bg-popover">
              <CommandInput
                placeholder="Type a command or search..."
                value={search}
                onValueChange={setSearch}
                className="border-0 focus:ring-0"
              />
              <CommandList className="max-h-[60vh] overflow-y-auto">
                <CommandEmpty>No results found.</CommandEmpty>

                {search.trim() ? (
                  <CommandGroup heading="Search Results">
                    {searchResults.map(note => (
                      <CommandItem
                        key={note._id}
                        onSelect={() => handleSelect(() => onSelectNote(note._id))}
                        className="cursor-pointer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>{note.title || "Untitled Note"}</span>
                        {note.isPinned && <Pin className="ml-2 h-3 w-3 text-primary" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <>
                    {/* Quick Actions */}
                    <CommandGroup heading="Quick Actions">
                      <CommandItem
                        onSelect={() => handleSelect(onCreateNote)}
                        className="cursor-pointer"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create New Note</span>
                        <kbd className="ml-auto text-xs bg-muted px-2 py-1 rounded">Ctrl+N</kbd>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => handleSelect(onToggleFocusMode)}
                        className="cursor-pointer"
                      >
                        <Maximize className="mr-2 h-4 w-4" />
                        <span>Toggle Focus Mode</span>
                        <kbd className="ml-auto text-xs bg-muted px-2 py-1 rounded">Ctrl+.</kbd>
                      </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    {/* Recent Notes */}
                    {recentNotes.length > 0 && (
                      <CommandGroup heading="Recent Notes">
                        {recentNotes.map(note => (
                          <CommandItem
                            key={note._id}
                            onSelect={() => handleSelect(() => onSelectNote(note._id))}
                            className="cursor-pointer"
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            <span>{note.title || "Untitled Note"}</span>
                            {note.isPinned && <Pin className="ml-2 h-3 w-3 text-primary" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Pinned Notes */}
                    {pinnedNotes.length > 0 && (
                      <CommandGroup heading="Pinned Notes">
                        {pinnedNotes.map(note => (
                          <CommandItem
                            key={note._id}
                            onSelect={() => handleSelect(() => onSelectNote(note._id))}
                            className="cursor-pointer"
                          >
                            <Pin className="mr-2 h-4 w-4" />
                            <span>{note.title || "Untitled Note"}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    <CommandSeparator />

                    {/* Navigation */}
                    <CommandGroup heading="Navigation">
                      <CommandItem
                        onSelect={() => handleSelect(() => onSetShowArchived(!showArchived))}
                        className="cursor-pointer"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        <span>{showArchived ? "Show Active Notes" : "Show Archived"}</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => handleSelect(onShowStatistics)}
                        className="cursor-pointer"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Study Statistics</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => handleSelect(onShowTagManager)}
                        className="cursor-pointer"
                      >
                        <Tags className="mr-2 h-4 w-4" />
                        <span>Manage Tags</span>
                      </CommandItem>
                    </CommandGroup>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <>
                        <CommandSeparator />
                        <CommandGroup heading="Tags">
                          {tags.slice(0, 8).map(tag => (
                            <CommandItem
                              key={tag.name}
                              onSelect={() => handleSelect(() => {
                                // Tag filtering would be handled by parent
                              })}
                              className="cursor-pointer"
                            >
                              <Hash className="mr-2 h-4 w-4" />
                              <span>{tag.name}</span>
                              <span className="ml-auto text-xs text-muted-foreground">{tag.count}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
