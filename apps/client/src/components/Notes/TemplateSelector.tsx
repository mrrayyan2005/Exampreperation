import { useState } from 'react';
import { FileText, Sparkles, Layout, BookOpen, Briefcase, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { NOTE_TEMPLATES, NoteTemplate, getTemplatesByCategory } from './templates';

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (template: NoteTemplate) => void;
}

type Category = 'all' | NoteTemplate['category'];

const CATEGORY_LABELS: Record<Category, string> = {
    all: 'All Templates',
    productivity: 'Productivity',
    study: 'Study',
    work: 'Work',
    personal: 'Personal',
};

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
    all: <Layout className="h-4 w-4" />,
    productivity: <Sparkles className="h-4 w-4" />,
    study: <BookOpen className="h-4 w-4" />,
    work: <Briefcase className="h-4 w-4" />,
    personal: <User className="h-4 w-4" />,
};

export function TemplateSelector({ isOpen, onClose, onSelectTemplate }: TemplateSelectorProps) {
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [hoveredTemplate, setHoveredTemplate] = useState<NoteTemplate | null>(null);

    const filteredTemplates = selectedCategory === 'all'
        ? NOTE_TEMPLATES
        : getTemplatesByCategory(selectedCategory);

    const categories: Category[] = ['all', 'productivity', 'study', 'work', 'personal'];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[600px] flex flex-col bg-popover border-border/30 p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/20">
                    <DialogTitle className="flex items-center gap-2.5 text-popover-foreground">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        Choose a Template
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 gap-0 overflow-hidden">
                    {/* Categories Sidebar */}
                    <div className="w-52 shrink-0 border-r border-border/20 bg-muted/30">
                        <div className="p-3 space-y-0.5">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={cn(
                                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                                        selectedCategory === category
                                            ? "bg-muted text-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {CATEGORY_ICONS[category]}
                                    <span className="flex-1 text-left">{CATEGORY_LABELS[category]}</span>
                                    {category !== 'all' && (
                                        <span className="text-[10px] text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded">
                                            {getTemplatesByCategory(category).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="flex-1 flex gap-0 min-w-0 bg-background/50">
                        <ScrollArea className="flex-1">
                            <div className="p-5 grid grid-cols-2 gap-3">
                                {filteredTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => onSelectTemplate(template)}
                                        onMouseEnter={() => setHoveredTemplate(template)}
                                        onMouseLeave={() => setHoveredTemplate(null)}
                                        className={cn(
                                            "text-left p-4 rounded-xl border transition-all duration-200 group",
                                            hoveredTemplate?.id === template.id
                                                ? "border-primary/40 bg-muted"
                                                : "border-border/30 bg-popover hover:border-border/50 hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl shrink-0">{template.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-popover-foreground/90 text-[13px] truncate">
                                                    {template.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                    {template.description}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                                                    <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-0 hover:bg-muted/80">
                                                        {template.blocks.length} blocks
                                                    </Badge>
                                                    {template.defaultTags.slice(0, 1).map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-[10px] border-border/50 text-muted-foreground bg-transparent hover:bg-muted/30">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Preview Panel */}
                        <div className="w-64 shrink-0 border-l border-white/[0.06] bg-[#0f0f0f] hidden lg:block">
                            {hoveredTemplate ? (
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <span className="text-3xl">{hoveredTemplate.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-white text-sm truncate">{hoveredTemplate.name}</h4>
                                            <p className="text-[11px] text-violet-400/80 mt-0.5">
                                                {CATEGORY_LABELS[hoveredTemplate.category]}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-white/50 leading-relaxed">
                                        {hoveredTemplate.description}
                                    </p>

                                    <div className="space-y-2">
                                        <h5 className="text-[11px] font-medium text-white/70 uppercase tracking-wide">Blocks included</h5>
                                        <ul className="space-y-1.5">
                                            {hoveredTemplate.blocks.slice(0, 6).map((block, i) => (
                                                <li key={i} className="flex items-center gap-2 text-xs text-white/40">
                                                    <span className="w-1 h-1 rounded-full bg-violet-500/60" />
                                                    <span className="truncate">
                                                        {block.type === 'heading'
                                                            ? `Heading: ${block.content?.slice(0, 25) || '...'}${(block.content?.length || 0) > 25 ? '...' : ''}`
                                                            : block.type === 'richText'
                                                            ? 'Rich text'
                                                            : block.type === 'checklist'
                                                            ? 'Checklist'
                                                            : block.type === 'table'
                                                            ? 'Table'
                                                            : block.type === 'divider'
                                                            ? 'Divider'
                                                            : block.type === 'quote'
                                                            ? 'Quote'
                                                            : 'Text'
                                                        }
                                                    </span>
                                                </li>
                                            ))}
                                            {hoveredTemplate.blocks.length > 6 && (
                                                <li className="text-[10px] text-white/30 pl-3">
                                                    +{hoveredTemplate.blocks.length - 6} more blocks
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="pt-3 border-t border-white/[0.06]">
                                        <Button
                                            onClick={() => onSelectTemplate(hoveredTemplate)}
                                            className="w-full bg-violet-500/80 hover:bg-violet-500 text-white border-0 h-8 text-xs"
                                        >
                                            Use Template
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-white/30 p-6 text-center">
                                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                                        <FileText className="h-5 w-5 text-white/20" />
                                    </div>
                                    <p className="text-xs text-white/40">Hover over a template to preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-white/[0.06] bg-[#0f0f0f]">
                    <p className="text-xs text-white/40">
                        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                    </p>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="h-8 px-4 text-xs text-white/60 hover:text-white hover:bg-white/[0.06]"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default TemplateSelector;
