import { useState, useEffect, useRef } from 'react';
import { Edit2, Check, Trash2, Copy, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MathBlockProps {
    content: string;
    onChange: (content: string) => void;
    onRemove?: () => void;
    displayMode?: boolean;
}

export function MathBlock({ content, onChange, onRemove, displayMode = true }: MathBlockProps) {
    const [isEditing, setIsEditing] = useState(!content);
    const [latex, setLatex] = useState(content);
    const [renderedHtml, setRenderedHtml] = useState('');
    const [hasError, setHasError] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (latex.trim()) {
            try {
                const html = katex.renderToString(latex, {
                    displayMode,
                    throwOnError: true,
                });
                setRenderedHtml(html);
                setHasError(false);
            } catch (error) {
                setHasError(true);
                try {
                    // Try to render with error handling
                    const html = katex.renderToString(latex, {
                        displayMode,
                        throwOnError: false,
                        strict: false,
                    });
                    setRenderedHtml(html);
                } catch {
                    setRenderedHtml('');
                }
            }
        } else {
            setRenderedHtml('');
            setHasError(false);
        }
    }, [latex, displayMode]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(latex.length, latex.length);
        }
    }, [isEditing]);

    const handleSave = () => {
        onChange(latex);
        setIsEditing(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(latex);
        toast.success('LaTeX copied to clipboard');
    };

    const commonEquations = [
        { name: 'Quadratic', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
        { name: 'Einstein', latex: 'E = mc^2' },
        { name: 'Integral', latex: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}' },
        { name: 'Sum', latex: '\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n' },
        { name: 'Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
        { name: 'Fraction', latex: '\\frac{a}{b}' },
        { name: 'Square Root', latex: '\\sqrt{x}' },
        { name: 'Limit', latex: '\\lim_{x \\to \\infty} f(x) = L' },
    ];

    if (isEditing) {
        return (
            <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calculator className="h-4 w-4" />
                        {displayMode ? 'Block Equation' : 'Inline Equation'}
                    </div>
                    <div className="flex items-center gap-1">
                        {onRemove && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={onRemove}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleSave}
                            disabled={!latex.trim()}
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Textarea
                    ref={textareaRef}
                    value={latex}
                    onChange={(e) => setLatex(e.target.value)}
                    placeholder="Enter LaTeX equation...&#10;e.g., E = mc^2&#10;or \int_0^1 x^2 dx"
                    className="font-mono text-sm min-h-[80px] resize-none"
                />

                {hasError && latex.trim() && (
                    <p className="text-xs text-destructive">
                        LaTeX syntax error. Check your equation.
                    </p>
                )}

                {/* Preview */}
                {renderedHtml && (
                    <div className="p-3 bg-muted/50 rounded-md">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        <div 
                            className={cn(
                                "overflow-x-auto",
                                displayMode ? "text-center py-2" : "inline-block"
                            )}
                            dangerouslySetInnerHTML={{ __html: renderedHtml }}
                        />
                    </div>
                )}

                {/* Common Equations */}
                <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Quick Insert:</p>
                    <div className="flex flex-wrap gap-1">
                        {commonEquations.map((eq) => (
                            <button
                                key={eq.name}
                                onClick={() => setLatex(eq.latex)}
                                className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
                                title={eq.name}
                            >
                                {eq.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={cn(
                "group relative rounded-lg border bg-card hover:border-primary/30 transition-colors",
                displayMode ? "p-4 my-2" : "inline-flex items-center px-1 py-0.5"
            )}
        >
            {renderedHtml ? (
                <div 
                    className={cn(
                        "overflow-x-auto",
                        displayMode && "flex justify-center"
                    )}
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
            ) : (
                <span className="text-muted-foreground italic text-sm">
                    {displayMode ? 'Empty equation block' : 'Empty math'}
                </span>
            )}

            {/* Hover Controls */}
            <div className={cn(
                "absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                !displayMode && "right-0 -top-6"
            )}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-background/80 backdrop-blur-sm"
                    onClick={() => setIsEditing(true)}
                >
                    <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-background/80 backdrop-blur-sm"
                    onClick={handleCopy}
                >
                    <Copy className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}