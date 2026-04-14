import { useEffect, useCallback } from 'react';

interface NoteShortcutsOptions {
  onNewNote: () => void;
  onSearch: () => void;
  onToggleFocusMode: () => void;
  onPinNote?: () => void;
  onArchiveNote?: () => void;
  onDeleteNote?: () => void;
  onSaveNote?: () => void;
  isFocusMode?: boolean;
}

export function useNoteShortcuts({
  onNewNote,
  onSearch,
  onToggleFocusMode,
  onPinNote,
  onArchiveNote,
  onDeleteNote,
  onSaveNote,
  isFocusMode = false
}: NoteShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Allow Ctrl/Cmd + shortcuts even when typing
      if (!e.ctrlKey && !e.metaKey) return;
    }

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    // Ctrl/Cmd + K: Search
    if (isCtrlOrCmd && e.key === 'k') {
      e.preventDefault();
      onSearch();
    }

    // Ctrl/Cmd + N: New note
    if (isCtrlOrCmd && e.key === 'n') {
      e.preventDefault();
      onNewNote();
    }

    // Ctrl/Cmd + .: Toggle focus mode
    if (isCtrlOrCmd && e.key === '.') {
      e.preventDefault();
      onToggleFocusMode();
    }

    // Escape: Exit focus mode
    if (e.key === 'Escape' && isFocusMode) {
      e.preventDefault();
      onToggleFocusMode();
    }

    // Ctrl/Cmd + S: Save note
    if (isCtrlOrCmd && e.key === 's' && onSaveNote) {
      e.preventDefault();
      onSaveNote();
    }

    // Ctrl/Cmd + P: Pin note
    if (isCtrlOrCmd && e.key === 'p' && onPinNote) {
      e.preventDefault();
      onPinNote();
    }

    // Ctrl/Cmd + Shift + A: Archive note
    if (isCtrlOrCmd && e.shiftKey && e.key === 'A' && onArchiveNote) {
      e.preventDefault();
      onArchiveNote();
    }

    // Ctrl/Cmd + Shift + D: Delete note
    if (isCtrlOrCmd && e.shiftKey && e.key === 'D' && onDeleteNote) {
      e.preventDefault();
      onDeleteNote();
    }
  }, [onNewNote, onSearch, onToggleFocusMode, onPinNote, onArchiveNote, onDeleteNote, onSaveNote, isFocusMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useNoteShortcuts;
