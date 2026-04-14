import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Plus, 
    Trash2, 
    CheckSquare, 
    GripVertical 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

interface ChecklistBlockProps {
    content?: string; // JSON string of ChecklistItem[]
    onChange: (content: string) => void;
}

export function ChecklistBlock({ content, onChange }: ChecklistBlockProps) {
    // Parse checklist data from content or use default
    let items: ChecklistItem[] = [];
    if (content) {
        try {
            items = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse checklist content:', e);
            items = [];
        }
    }

    const updateItems = (newItems: ChecklistItem[]) => {
        onChange(JSON.stringify(newItems));
    };

    const addItem = () => {
        const newItem: ChecklistItem = {
            id: Math.random().toString(36).substr(2, 9),
            text: '',
            checked: false
        };
        updateItems([...items, newItem]);
    };

    const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
        const newItems = items.map(item => 
            item.id === id ? { ...item, ...updates } : item
        );
        updateItems(newItems);
    };

    const removeItem = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        updateItems(newItems);
    };

    const toggleItem = (id: string) => {
        const item = items.find(i => i.id === id);
        if (item) {
            updateItem(id, { checked: !item.checked });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addItem();
            // Focus the new item after a short delay
            setTimeout(() => {
                const inputs = document.querySelectorAll('.checklist-input');
                const newInput = inputs[index + 1] as HTMLInputElement;
                newInput?.focus();
            }, 50);
        }
    };

    const progress = {
        total: items.length,
        completed: items.filter(i => i.checked).length,
        percentage: items.length > 0 ? Math.round((items.filter(i => i.checked).length / items.length) * 100) : 0
    };

    if (items.length === 0) {
        return (
            <button
                onClick={addItem}
                className="w-full py-8 border-2 border-dashed rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center gap-2 text-muted-foreground"
            >
                <CheckSquare className="h-8 w-8" />
                <span>Click to add a checklist</span>
            </button>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-background">
            {/* Header with progress */}
            <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckSquare className="h-4 w-4" />
                    <span>
                        {progress.completed} of {progress.total} completed
                    </span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {progress.percentage}%
                    </span>
                </div>
                <Button variant="ghost" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                </Button>
            </div>

            {/* Checklist Items */}
            <div className="p-3 space-y-2">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={cn(
                            "group flex items-center gap-2 p-2 rounded-md transition-colors",
                            "hover:bg-muted/50 focus-within:bg-muted/30"
                        )}
                    >
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                        
                        <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="shrink-0"
                        />
                        
                        <Input
                            value={item.text}
                            onChange={(e) => updateItem(item.id, { text: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            placeholder="Add item..."
                            className={cn(
                                "flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 checklist-input",
                                item.checked && "line-through text-muted-foreground"
                            )}
                        />
                        
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => removeItem(item.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Empty state hint */}
            {items.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                    No items yet. Click "Add Item" to start.
                </div>
            )}
        </div>
    );
}