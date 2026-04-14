import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { institutionService } from '@/api/institutionService';
import { toast } from 'sonner';

interface BulkUploadModalProps {
    onSuccess?: () => void;
}

export function BulkUploadModal({ onSuccess }: BulkUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [result, setResult] = useState<{ success: number; failed: number; errors: any[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const data = await institutionService.bulkUploadStudents(file);
            setResult(data);
            if (data.success > 0) {
                toast.success(`Successfully added ${data.success} students`);
                if (onSuccess) onSuccess();
            }
            if (data.failed > 0) {
                toast.warning(`Failed to add ${data.failed} students`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload Students
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Students</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with columns: name, email, password, examTypes.
                    </DialogDescription>
                </DialogHeader>

                {!result ? (
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="csv-file">CSV File</Label>
                            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                        </div>
                        {file && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {file.name}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="py-4 space-y-4">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-semibold">{result.success} Successful</span>
                        </div>
                        {result.failed > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="font-semibold">{result.failed} Failed</span>
                                </div>
                                <div className="max-h-[150px] overflow-y-auto bg-slate-50 p-2 rounded text-xs">
                                    {result.errors.map((err, i) => (
                                        <div key={i} className="text-red-500">
                                            {err.email}: {err.error}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Button variant="outline" size="sm" onClick={() => { setFile(null); setResult(null); }}>
                            Upload Another
                        </Button>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                    {!result && (
                        <Button onClick={handleUpload} disabled={!file || isUploading}>
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
