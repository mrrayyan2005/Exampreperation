import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  Search, 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Target, 
  User, 
  Settings, 
  Moon, 
  Sun,
  Layout as LayoutIcon,
  Timer
} from 'lucide-react';
import { useTheme } from 'next-themes';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen}
      label="Global Command Palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-background/50 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-[640px] bg-popover text-popover-foreground rounded-xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-border px-4 py-3 gap-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Command.Input 
            placeholder="Type a command or search..." 
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground h-4"
          />
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] text-muted-foreground font-medium">
            <span className="text-xs">ESC</span>
          </div>
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <Item onSelect={() => runCommand(() => navigate('/dashboard'))}>
              <LayoutDashboard className="h-4 w-4 mr-2" />
              <span>Dashboard</span>
              <Shortcut>G D</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => navigate('/subjects'))}>
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Study Library</span>
              <Shortcut>G S</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => navigate('/study-sessions'))}>
              <Timer className="h-4 w-4 mr-2" />
              <span>Study Sessions</span>
              <Shortcut>G T</Shortcut>
            </Item>
            <Item onSelect={() => runCommand(() => navigate('/revision-center'))}>
              <Calendar className="h-4 w-4 mr-2" />
              <span>Revision Center</span>
              <Shortcut>G R</Shortcut>
            </Item>
          </Command.Group>

          <Command.Separator className="h-px bg-border my-2" />

          <Command.Group heading="Personal" className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <Item onSelect={() => runCommand(() => navigate('/profile'))}>
              <User className="h-4 w-4 mr-2" />
              <span>Profile</span>
            </Item>
            <Item onSelect={() => runCommand(() => navigate('/daily-goals'))}>
              <Target className="h-4 w-4 mr-2" />
              <span>Daily Goals</span>
            </Item>
          </Command.Group>

          <Command.Separator className="h-px bg-border my-2" />

          <Command.Group heading="Settings" className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <Item onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}>
              {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              <span>Toggle Theme</span>
            </Item>
          </Command.Group>
        </Command.List>

        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t border-border text-[10px] text-muted-foreground">
            <div className="flex gap-4">
                <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-muted border border-border">↑↓</kbd> to navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1 rounded bg-muted border border-border">↵</kbd> to select</span>
            </div>
            <span className="font-medium text-primary/70 italic underline decoration-primary/30 underline-offset-2">ExamPrep Explorer</span>
        </div>
      </div>
    </Command.Dialog>
  );
};

const Item = ({ children, onSelect }: { children: React.ReactNode, onSelect: () => void }) => (
  <Command.Item
    onSelect={onSelect}
    className="flex items-center px-4 py-2.5 rounded-lg text-sm cursor-pointer select-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none transition-colors group"
  >
    {children}
  </Command.Item>
);

const Shortcut = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-auto text-[10px] font-medium text-muted-foreground/60 border border-border/50 rounded px-1 group-aria-selected:border-accent-foreground/20">
    {children}
  </span>
);
