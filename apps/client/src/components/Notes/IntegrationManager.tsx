import { useState, useRef } from 'react';
import { 
    Upload, 
    Download, 
    FileText, 
    FileSpreadsheet, 
    FileCode, 
    Mail, 
    Calendar, 
    Cloud,
    ExternalLink,
    Check,
    X,
    Loader2,
    AlertCircle,
    ChevronRight,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosInstance';

interface IntegrationManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete?: () => void;
}

type ImportFormat = 'markdown' | 'html' | 'txt' | 'json';
type ExportFormat = 'pdf' | 'word' | 'markdown' | 'html' | 'json';

interface ImportJob {
    id: string;
    fileName: string;
    format: ImportFormat;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    notesCreated: number;
    error?: string;
}

export function IntegrationManager({ isOpen, onClose, onImportComplete }: IntegrationManagerProps) {
    const [activeTab, setActiveTab] = useState('import');
    const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedExportFormat, setSelectedExportFormat] = useState<ExportFormat>('markdown');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            await processImport(file);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const processImport = async (file: File) => {
        const format = detectFormat(file.name);
        const jobId = Date.now().toString();
        
        const newJob: ImportJob = {
            id: jobId,
            fileName: file.name,
            format,
            status: 'processing',
            progress: 0,
            notesCreated: 0,
        };

        setImportJobs(prev => [newJob, ...prev]);

        try {
            const content = await readFile(file);
            
            // Simulate progress
            const progressInterval = setInterval(() => {
                setImportJobs(prev => prev.map(job => 
                    job.id === jobId 
                        ? { ...job, progress: Math.min(job.progress + 10, 90) }
                        : job
                ));
            }, 200);

            // Parse and create notes based on format
            const notes = parseContent(content, format);
            
            clearInterval(progressInterval);

            // Create notes via API
            let created = 0;
            for (const note of notes) {
                try {
                    await axiosInstance.post('/notes', note);
                    created++;
                } catch (error) {
                    console.error('Failed to create note:', error);
                }
            }

            setImportJobs(prev => prev.map(job => 
                job.id === jobId 
                    ? { 
                        ...job, 
                        status: 'completed', 
                        progress: 100, 
                        notesCreated: created 
                    }
                    : job
            ));

            toast.success(`Imported ${created} notes from ${file.name}`);
            onImportComplete?.();

        } catch (error) {
            console.error('Import failed:', error);
            setImportJobs(prev => prev.map(job => 
                job.id === jobId 
                    ? { 
                        ...job, 
                        status: 'failed', 
                        error: 'Failed to process file' 
                    }
                    : job
            ));
            toast.error(`Failed to import ${file.name}`);
        }
    };

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    const detectFormat = (fileName: string): ImportFormat => {
        const ext = fileName.toLowerCase().split('.').pop();
        switch (ext) {
            case 'md': return 'markdown';
            case 'html': case 'htm': return 'html';
            case 'txt': return 'txt';
            case 'json': return 'json';
            default: return 'txt';
        }
    };

    interface ParsedNote {
        title: string;
        content: { blocks: Array<{ type: string; content: string }> };
        tags: string[];
    }

    const parseContent = (content: string, format: ImportFormat): ParsedNote[] => {
        const notes: ParsedNote[] = [];

        switch (format) {
            case 'markdown': {
                // Split by headers (## or #)
                const sections = content.split(/(?=^#{1,2}\s)/m).filter(s => s.trim());
                for (const section of sections) {
                    const lines = section.split('\n');
                    const titleMatch = lines[0].match(/^#{1,2}\s+(.+)$/);
                    const title = titleMatch ? titleMatch[1] : 'Untitled';
                    const body = lines.slice(1).join('\n').trim();
                    
                    notes.push({
                        title,
                        content: {
                            blocks: [
                                { type: 'paragraph', content: body }
                            ]
                        },
                        tags: ['imported', 'markdown']
                    });
                }
                break;
            }
            case 'html': {
                // Simple HTML parsing
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');
                const headings = doc.querySelectorAll('h1, h2');
                
                headings.forEach((heading) => {
                    const title = heading.textContent || 'Untitled';
                    let body = '';
                    let sibling = heading.nextElementSibling;
                    
                    while (sibling && !['H1', 'H2'].includes(sibling.tagName)) {
                        body += sibling.textContent + '\n';
                        sibling = sibling.nextElementSibling;
                    }

                    notes.push({
                        title,
                        content: {
                            blocks: [
                                { type: 'paragraph', content: body.trim() }
                            ]
                        },
                        tags: ['imported', 'html']
                    });
                });
                break;
            }
            case 'json': {
                try {
                    interface JsonNoteItem {
                        title?: string;
                        content?: { blocks: Array<{ type: string; content: string }> };
                        body?: string;
                        tags?: string[];
                    }
                    const data = JSON.parse(content) as JsonNoteItem | JsonNoteItem[];
                    if (Array.isArray(data)) {
                        notes.push(...data.map((item: JsonNoteItem) => ({
                            title: item.title || 'Untitled',
                            content: item.content || { blocks: [{ type: 'paragraph', content: item.body || '' }] },
                            tags: ['imported', 'json', ...(item.tags || [])]
                        })));
                    }
                } catch {
                    notes.push({
                        title: 'Imported Note',
                        content: { blocks: [{ type: 'paragraph', content }] },
                        tags: ['imported', 'json']
                    });
                }
                break;
            }
            case 'txt':
            default: {
                // Split by double newlines
                const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
                if (paragraphs.length > 0) {
                    notes.push({
                        title: paragraphs[0].slice(0, 50) || 'Imported Note',
                        content: {
                            blocks: paragraphs.map(p => ({ type: 'paragraph', content: p }))
                        },
                        tags: ['imported', 'txt']
                    });
                }
                break;
            }
        }

        return notes.length > 0 ? notes : [{
            title: 'Imported Note',
            content: { blocks: [{ type: 'paragraph', content }] },
            tags: ['imported']
        }];
    };

    const handleExport = async (format: ExportFormat) => {
        setIsExporting(true);
        setSelectedExportFormat(format);

        try {
            const response = await axiosInstance.get('/notes');
            if (!response.data.success) {
                throw new Error('Failed to fetch notes');
            }

            const notes = response.data.data;
            let content = '';
            let fileName = '';
            let mimeType = '';

            interface ExportNote {
                title: string;
                content?: { blocks?: Array<{ content?: string }> };
                tags?: string[];
                createdAt: string;
                updatedAt?: string;
            }

            switch (format) {
                case 'markdown':
                    content = (notes as ExportNote[]).map((note) => {
                        const body = note.content?.blocks?.map((b) => b.content).filter(Boolean).join('\n\n') || '';
                        return `# ${note.title}\n\n${body}\n\n---\n\nTags: ${note.tags?.join(', ') || 'none'}\nCreated: ${new Date(note.createdAt).toLocaleDateString()}`;
                    }).join('\n\n');
                    fileName = `notes-export-${Date.now()}.md`;
                    mimeType = 'text/markdown';
                    break;

                case 'html':
                    content = `<!DOCTYPE html>
<html>
<head>
    <title>Exported Notes</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .note { margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .note-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .note-meta { color: #666; font-size: 14px; margin-bottom: 15px; }
        .note-content { line-height: 1.6; }
    </style>
</head>
<body>
    <h1>My Notes</h1>
    ${(notes as ExportNote[]).map((note) => {
        const body = note.content?.blocks?.map((b) => `<p>${b.content || ''}</p>`).join('') || '';
        return `
    <div class="note">
        <div class="note-title">${note.title}</div>
        <div class="note-meta">Tags: ${note.tags?.join(', ') || 'none'} | Created: ${new Date(note.createdAt).toLocaleDateString()}</div>
        <div class="note-content">${body}</div>
    </div>`;
    }).join('')}
</body>
</html>`;
                    fileName = `notes-export-${Date.now()}.html`;
                    mimeType = 'text/html';
                    break;

                case 'json':
                    content = JSON.stringify((notes as ExportNote[]).map((note) => ({
                        title: note.title,
                        content: note.content,
                        tags: note.tags,
                        createdAt: note.createdAt,
                        updatedAt: note.updatedAt
                    })), null, 2);
                    fileName = `notes-export-${Date.now()}.json`;
                    mimeType = 'application/json';
                    break;

                case 'pdf':
                case 'word':
                    // These would require server-side generation
                    toast.info(`${format.toUpperCase()} export requires server processing`);
                    setIsExporting(false);
                    return;
            }

            // Download file
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`Exported ${notes.length} notes as ${format.toUpperCase()}`);

        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export notes');
        } finally {
            setIsExporting(false);
        }
    };

    const clearCompletedJobs = () => {
        setImportJobs(prev => prev.filter(job => job.status === 'processing' || job.status === 'pending'));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex items-center gap-3">
                        <Cloud className="h-6 w-6 text-primary" />
                        <div>
                            <h2 className="text-xl font-bold">Import & Export</h2>
                            <p className="text-sm text-muted-foreground">
                                Bring notes in or take them out
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="mx-4 mt-4">
                        <TabsTrigger value="import" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Import
                        </TabsTrigger>
                        <TabsTrigger value="export" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {/* Import Tab */}
                            <TabsContent value="import" className="mt-0 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Import Notes</CardTitle>
                                        <CardDescription>
                                            Supported formats: Markdown (.md), HTML (.html), Text (.txt), JSON (.json)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div 
                                            className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">Click to select files or drag and drop</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                You can select multiple files
                                            </p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".md,.html,.htm,.txt,.json"
                                                multiple
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </div>

                                        {/* Import Jobs */}
                                        {importJobs.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium">Recent Imports</h4>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={clearCompletedJobs}
                                                    >
                                                        Clear Completed
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {importJobs.map(job => (
                                                        <div 
                                                            key={job.id} 
                                                            className="p-3 rounded-lg border bg-card"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    {job.status === 'processing' && (
                                                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                                    )}
                                                                    {job.status === 'completed' && (
                                                                        <Check className="h-4 w-4 text-green-500" />
                                                                    )}
                                                                    {job.status === 'failed' && (
                                                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                                                    )}
                                                                    <span className="text-sm font-medium truncate max-w-[200px]">
                                                                        {job.fileName}
                                                                    </span>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {job.format}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            
                                                            {job.status === 'processing' && (
                                                                <Progress value={job.progress} className="h-1" />
                                                            )}
                                                            
                                                            {job.status === 'completed' && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Created {job.notesCreated} notes
                                                                </p>
                                                            )}
                                                            
                                                            {job.status === 'failed' && job.error && (
                                                                <p className="text-xs text-destructive">
                                                                    {job.error}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Coming Soon</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 opacity-50">
                                            <ExternalLink className="h-5 w-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">Notion Import</div>
                                                <div className="text-xs text-muted-foreground">Import from Notion workspaces</div>
                                            </div>
                                            <Badge variant="secondary">Soon</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 opacity-50">
                                            <ExternalLink className="h-5 w-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">Evernote Import</div>
                                                <div className="text-xs text-muted-foreground">Import .enex files</div>
                                            </div>
                                            <Badge variant="secondary">Soon</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 opacity-50">
                                            <ExternalLink className="h-5 w-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">OneNote Import</div>
                                                <div className="text-xs text-muted-foreground">Import from OneNote</div>
                                            </div>
                                            <Badge variant="secondary">Soon</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Export Tab */}
                            <TabsContent value="export" className="mt-0 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Export All Notes</CardTitle>
                                        <CardDescription>
                                            Download your notes in various formats
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-3">
                                            <ExportOption
                                                icon={<FileText className="h-5 w-5" />}
                                                title="Markdown"
                                                description=".md files"
                                                onClick={() => handleExport('markdown')}
                                                isLoading={isExporting && selectedExportFormat === 'markdown'}
                                            />
                                            <ExportOption
                                                icon={<FileCode className="h-5 w-5" />}
                                                title="HTML"
                                                description="Web page"
                                                onClick={() => handleExport('html')}
                                                isLoading={isExporting && selectedExportFormat === 'html'}
                                            />
                                            <ExportOption
                                                icon={<FileSpreadsheet className="h-5 w-5" />}
                                                title="JSON"
                                                description="Structured data"
                                                onClick={() => handleExport('json')}
                                                isLoading={isExporting && selectedExportFormat === 'json'}
                                            />
                                            <ExportOption
                                                icon={<FileText className="h-5 w-5" />}
                                                title="PDF"
                                                description="Print format"
                                                onClick={() => handleExport('pdf')}
                                                isLoading={isExporting && selectedExportFormat === 'pdf'}
                                                disabled
                                            />
                                            <ExportOption
                                                icon={<FileText className="h-5 w-5" />}
                                                title="Word"
                                                description=".docx file"
                                                onClick={() => handleExport('word')}
                                                isLoading={isExporting && selectedExportFormat === 'word'}
                                                disabled
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Cloud Sync</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 opacity-50">
                                            <Cloud className="h-5 w-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">Google Drive</div>
                                                <div className="text-xs text-muted-foreground">Auto-sync to Google Drive</div>
                                            </div>
                                            <Badge variant="secondary">Soon</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 opacity-50">
                                            <Mail className="h-5 w-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">Email Backup</div>
                                                <div className="text-xs text-muted-foreground">Daily email backups</div>
                                            </div>
                                            <Badge variant="secondary">Soon</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 opacity-50">
                                            <Calendar className="h-5 w-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">Calendar Sync</div>
                                                <div className="text-xs text-muted-foreground">Study reminders</div>
                                            </div>
                                            <Badge variant="secondary">Soon</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>
            </div>
        </div>
    );
}

// Export Option Component
interface ExportOptionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

function ExportOption({ icon, title, description, onClick, isLoading, disabled }: ExportOptionProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="text-muted-foreground">{icon}</div>
            <div className="flex-1">
                <div className="font-medium text-sm">{title}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
            </div>
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : disabled ? (
                <Badge variant="secondary" className="text-[10px]">Soon</Badge>
            ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
        </button>
    );
}