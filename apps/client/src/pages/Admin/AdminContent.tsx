import React, { useState } from 'react';
import { Upload, FileJson, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

// Admin Content Tool for Bulk Uploads
const AdminContent = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadType, setUploadType] = useState<'syllabus' | 'questions'>('syllabus');
    const [jsonContent, setJsonContent] = useState('');
    const [subject, setSubject] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                // Validate JSON
                JSON.parse(text);
                setJsonContent(text);
                toast.success('JSON file loaded and validated');
            } catch (err) {
                toast.error('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    const handleUpload = async () => {
        if (!jsonContent) {
            toast.error('Please provide JSON content');
            return;
        }

        if (uploadType === 'syllabus' && !subject) {
            toast.error('Please provide a subject name for syllabus upload');
            return;
        }

        setIsUploading(true);
        try {
            const data = JSON.parse(jsonContent);
            const endpoint = uploadType === 'syllabus'
                ? '/admin/content/syllabus'
                : '/admin/content/questions';

            const payload = uploadType === 'syllabus'
                ? { subject, data: data.data || data } // Support both {data: [...]} and raw array
                : { questions: data.questions || data }; // Support both {questions: [...]} and raw array

            await axios.post(endpoint, payload);

            toast.success(`${uploadType === 'syllabus' ? 'Syllabus' : 'Questions'} uploaded successfully!`);
            setJsonContent('');
            if (uploadType === 'syllabus') setSubject('');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || `Failed to upload ${uploadType}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                <p className="text-muted-foreground">
                    Bulk upload syllabus data and questions using JSON files.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Configuration Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="p-6 rounded-xl border bg-card shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5 text-primary" />
                            Settings
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Upload Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setUploadType('syllabus')}
                                        className={`px-3 py-2 rounded-md text-xs font-medium border transition-all ${uploadType === 'syllabus'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background hover:bg-secondary'
                                            }`}
                                    >
                                        Syllabus
                                    </button>
                                    <button
                                        onClick={() => setUploadType('questions')}
                                        className={`px-3 py-2 rounded-md text-xs font-medium border transition-all ${uploadType === 'questions'
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background hover:bg-secondary'
                                            }`}
                                    >
                                        Questions
                                    </button>
                                </div>
                            </div>

                            {uploadType === 'syllabus' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subject Name</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g. Mathematics"
                                        className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Upload JSON File</label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 border-muted-foreground/30 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-xs text-muted-foreground">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                    </div>
                                    <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="p-6 rounded-xl border bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/50 space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <Info className="h-4 w-4" />
                            JSON Format Info
                        </h3>
                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                            {uploadType === 'syllabus'
                                ? "Ensure your JSON follows the hierarchical structure: { data: [{ title, priority, children: [...] }] }"
                                : "Ensure your questions array is formatted as: { questions: [{ text, options: [], correctOption: 0, explanation }] }"}
                        </p>
                    </div>
                </div>

                {/* Editor/Preview Card */}
                <div className="md:col-span-2 p-6 rounded-xl border bg-card shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FileJson className="h-5 w-5 text-yellow-500" />
                            JSON Preview/Edit
                        </h2>
                        {jsonContent && (
                            <button
                                onClick={() => setJsonContent('')}
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <textarea
                        value={jsonContent}
                        onChange={(e) => setJsonContent(e.target.value)}
                        placeholder="Paste your JSON content here or upload a file..."
                        className="w-full h-[400px] p-4 rounded-lg border bg-secondary/20 font-mono text-xs focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                    />

                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !jsonContent}
                        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                Confirm Bulk Upload
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Help icons
const SettingsIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default AdminContent;
