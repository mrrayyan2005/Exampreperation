import { useState, useEffect, useRef } from 'react';
import { FileText, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import axiosInstance from '@/api/axiosInstance';

interface NoteSuggestion {
    _id: string;
    title: string;
    updatedAt: string;
}

interface LinkSuggestionsProps {
    query: string;
    onSelect: (noteId: string, title: string) => void;
    onClose: () => void;
    position: { top: number; left: number };
}

export function LinkSuggestions({ query, onSelect, onClose, position }: LinkSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<NoteSuggestion[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Fetch suggestions based on query
    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const response = await axiosInstance.get('/notes', {
                    params: {
                        search: query,
                        limit: 10
                    }
                });
                
                if (response.data.success) {
                    setSuggestions(response.data.data);
                    setSelectedIndex(0);
                }
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [query]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev < suggestions.length - 1 ? prev + 1 : prev
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (suggestions[selectedIndex]) {
                        onSelect(suggestions[selectedIndex]._id, suggestions[selectedIndex].title);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [suggestions, selectedIndex, onSelect, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        const selectedElement = itemRefs.current[selectedIndex];
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (suggestions.length === 0 && !isLoading) {
        return (
            <div
                ref={containerRef}
                className="absolute z-50 bg-popover border rounded-lg shadow-lg p-3 text-sm text-muted-foreground"
                style={{ top: position.top, left: position.left, minWidth: 280 }}
            >
                No notes found
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="absolute z-50 bg-popover border rounded-lg shadow-lg w-72 max-h-60 overflow-y-auto"
            style={{ top: position.top, left: position.left }}
        >
            <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center justify-between">
                    <span>LINK TO NOTE</span>
                    {query && <span className="text-[10px]">Search: "{query}"</span>}
                </div>
                
                {isLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                ) : (
                    suggestions.map((note, index) => (
                        <button
                            key={note._id}
                            ref={el => { itemRefs.current[index] = el; }}
                            onClick={() => onSelect(note._id, note.title)}
                            className={cn(
                                "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors",
                                selectedIndex === index 
                                    ? "bg-accent text-accent-foreground" 
                                    : "hover:bg-muted"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-md shrink-0",
                                selectedIndex === index ? "bg-accent-foreground/10" : "bg-muted"
                            )}>
                                <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                    {note.title || 'Untitled Note'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                            {selectedIndex === index && (
                                <CornerDownLeft className="h-3 w-3 text-muted-foreground" />
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}