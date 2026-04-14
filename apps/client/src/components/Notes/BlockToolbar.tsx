import { 
    Type, 
    Heading1, 
    CheckSquare, 
    Quote, 
    Minus,
    Image as ImageIcon,
    Table,
    Code,
    FunctionSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockType } from './DocumentEditor';

interface BlockToolbarProps {
    onAddBlock: (type: BlockType) => void;
    className?: string;
}

const BLOCKS = [
    { type: 'richText' as BlockType, label: 'Rich Text', icon: Type, shortcut: '/text', color: 'bg-blue-500' },
    { type: 'heading' as BlockType, label: 'Heading', icon: Heading1, shortcut: '/h1', color: 'bg-purple-500' },
    { type: 'checklist' as BlockType, label: 'Checklist', icon: CheckSquare, shortcut: '/todo', color: 'bg-green-500' },
    { type: 'quote' as BlockType, label: 'Quote', icon: Quote, shortcut: '/quote', color: 'bg-yellow-500' },
    { type: 'divider' as BlockType, label: 'Divider', icon: Minus, shortcut: '/---', color: 'bg-gray-500' },
    { type: 'image' as BlockType, label: 'Image', icon: ImageIcon, shortcut: '/img', color: 'bg-pink-500' },
    { type: 'table' as BlockType, label: 'Table', icon: Table, shortcut: '/table', color: 'bg-indigo-500' },
    { type: 'code' as BlockType, label: 'Code', icon: Code, shortcut: '/code', color: 'bg-orange-500' },
    { type: 'math' as BlockType, label: 'Math', icon: FunctionSquare, shortcut: '/math', color: 'bg-red-500' },
];

export function BlockToolbar({ onAddBlock, className }: BlockToolbarProps) {
    return (
        <div className={cn(
            "sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b py-2 px-4",
            className
        )}>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                <span className="text-xs font-medium text-muted-foreground mr-2 shrink-0">
                    Add:
                </span>
                {BLOCKS.map((block) => {
                    const Icon = block.icon;
                    return (
                        <button
                            key={block.type}
                            onClick={() => onAddBlock(block.type)}
                            className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted transition-colors shrink-0"
                            title={`${block.label} (${block.shortcut})`}
                        >
                            <div className={cn(
                                "p-1 rounded text-white",
                                block.color
                            )}>
                                <Icon className="h-3 w-3" />
                            </div>
                            <span className="text-xs font-medium">{block.label}</span>
                            <span className="text-[10px] text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                {block.shortcut}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}