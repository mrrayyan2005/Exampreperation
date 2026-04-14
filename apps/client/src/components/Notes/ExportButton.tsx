import { useState } from 'react';
import { Download, FileText, FileCode, FileType, File as FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExportService, ExportFormat } from './ExportService';
import { Document } from './DocumentEditor';
import { toast } from 'sonner';

interface ExportButtonProps {
    document: Document | null;
    className?: string;
}

interface ExportOption {
    format: ExportFormat;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
    {
        format: 'pdf',
        label: 'PDF',
        icon: <FileText className="h-4 w-4" />,
        description: 'Best for printing and sharing',
    },
    {
        format: 'markdown',
        label: 'Markdown',
        icon: <FileCode className="h-4 w-4" />,
        description: 'Plain text with formatting',
    },
    {
        format: 'html',
        label: 'HTML',
        icon: <FileType className="h-4 w-4" />,
        description: 'Web page format',
    },
    {
        format: 'word',
        label: 'Word',
        icon: <FileIcon className="h-4 w-4" />,
        description: 'Microsoft Word document',
    },
];

export function ExportButton({ document, className }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: ExportFormat) => {
        if (!document) {
            toast.error('No note selected');
            return;
        }

        setIsExporting(true);
        try {
            await ExportService.export(document, format);
            toast.success(`Exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export note');
        } finally {
            setIsExporting(false);
        }
    };

    if (!document) {
        return (
            <Button variant="outline" size="sm" disabled className={className}>
                <Download className="h-4 w-4 mr-2" />
                Export
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={className} disabled={isExporting}>
                    {isExporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Export Note</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {EXPORT_OPTIONS.map((option) => (
                    <DropdownMenuItem
                        key={option.format}
                        onClick={() => handleExport(option.format)}
                        disabled={isExporting}
                        className="flex items-start gap-3 py-2"
                    >
                        <div className="mt-0.5 text-muted-foreground">
                            {option.icon}
                        </div>
                        <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                                {option.description}
                            </div>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}