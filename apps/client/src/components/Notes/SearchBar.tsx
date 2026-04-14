import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (query: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    className?: string;
}

export function SearchBar({ 
    value, 
    onChange, 
    onSearch,
    placeholder = 'Search notes...',
    isLoading = false,
    className 
}: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(value);
    };

    const handleClear = () => {
        onChange('');
        onSearch('');
        inputRef.current?.focus();
    };

    // Debounce search on typing
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(value);
        }, 300);

        return () => clearTimeout(timer);
    }, [value, onSearch]);

    return (
        <form 
            onSubmit={handleSubmit}
            className={cn(
                "relative flex items-center",
                className
            )}
        >
            <div className={cn(
                "relative flex-1 flex items-center transition-all duration-200",
                isFocused && "ring-2 ring-primary/20 rounded-md"
            )}>
                <Search 
                    className={cn(
                        "absolute left-3 h-4 w-4 transition-colors",
                        isFocused ? "text-primary" : "text-muted-foreground"
                    )} 
                />
                
                <Input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="pl-10 pr-10 bg-muted/50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />

                {isLoading ? (
                    <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
                ) : value ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={handleClear}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                ) : null}
            </div>
        </form>
    );
}